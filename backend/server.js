// Import NodeJS Modules
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

// Import Project models
const UsersModel = require('./Models/Users');

// Setting the app
const app = express();
app.use(bodyparser.json());

// Make the connection with the MongoDB
mongoose.connect("mongodb+srv://ServerApp:GAJX3Xks967nzqd1@mous-cluster-qncgc.mongodb.net/MOUS-Cluster", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  // If everything was find, print the next message
  .then(() => {
    console.log('Connected to Data Base')

    // If there was an error, catch it and print it
  }).catch((err) => {
    console.log(err)
  });


// ################# Auxiliar functions #################

/**
 * Function to verify the JWT
 */
function verifyToken(req, res, next) {
  // Getthe auth header value
  const bearerHeader = req.headers['authorization'];

  // Check if berear is undefined
  if (typeof bearerHeader !== 'undefined') {

    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToke = bearer[1];
    // Set the token
    req.token = bearerToke;
    // Next middleware
    next();

  } else {
    // Return the error code
    return res.status(401).json({
      message: "Not logged in"
    });
  }
}

/**
 * Function to search in an array of followers if a user is already follower/following 
 * another user. 
 * 
 * @param {Array} Followers It is an arry with the followers object
 * @param {String} userName It is an string with the username you are looking 
 */
function searchInFollowers(arrFollowers, userName) {

  // Map the follower object array to an array with just the user names
  let Followers = arrFollowers.map((Follower) => {
    return Follower.strUserName;
  });

  // Check if the username it is in that array
  if (Followers.find((elem) => { return (elem == userName) })) {
    return true
  }

  return false
}


// ################# Server functions #################

//Set headers for the requests
//----------------------------------------------------------
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

// Start the server
app.listen('8080', () => {
  console.log("App running on localhost:8080");
});

// Function to add a new User (Sign In)
app.post('/api/user/Signin', (req, res) => {
  let jsonUser = req.body   // Get the JSON body
  let missingAttr = null    // Function to get if a attr is missing

  // Check that the JSON object has the Name, Username, E-mail and Password
  if (!jsonUser.strName) { missingAttr = "name" }
  if (!jsonUser.strUserName) { missingAttr = "user name" }
  if (!jsonUser.strEmail) { missingAttr = "email" }
  if (!jsonUser.strPassword) { missingAttr = "password" }

  // Check if there was any missing parameter
  if (missingAttr) {
    // Return the error code
    return res.status(406).json({
      message: `The ${missingAttr} parameter is missing`
    });
  }

  if(jsonUser.strUserName[0] != '@'){
    // Return the error code
    return res.status(400).json({
      message: `The user name must have an @ at the beginning`
    });
  }

  // Encrypt the password
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(jsonUser.strPassword, salt, function (err, hash) {

      // Ensure the indexes were created in order to them be unique
      UsersModel.init().then(() => {

        // Create the model
        const nUser = new UsersModel({
          strUserName: jsonUser.strUserName,
          strName: jsonUser.strName,
          strEmail: jsonUser.strEmail,
          strPassword: hash
        });

        // Save in the DB the new model
        nUser.save()
          .then(() => {
            // Return the succes code and messaeg
            return res.status(201).json({
              message: `The user ${nUser.strUserName} has been created correctly`
            });

            // Catch any posible error and send the corresponding message
          }).catch((err) => {

            // Check if it is a duplicate index error
            if (err.code == 11000) {
              // Get the message
              dupAttr = err.errmsg

              // Check if it is the User name or the Email
              if (dupAttr.includes("strUserName")) { dupAttr = "User Name" }
              else if (dupAttr.includes("strEmail")) { dupAttr = "Email" }

              // Send the error message and code
              return res.status(500)
                .json({ message: `ERROR: The ${dupAttr} already exist` });
            }
          });
      });
    });
  });
});


// Function to log in
app.post('/api/user/Login', (req, res) => {
  // Get the user body
  let nUser = req.body

  // Check if there is a User with that email
  UsersModel.findOne({ strEmail: nUser.strEmail },
    // And just bring the name, user name, profile image and the password
    ['strName', 'strUserName', 'imgProfile', 'strEmail', 'strPassword']).exec(function (err, User) {

      // If there is one...
      if (User) {
        // Compare the passwords
        bcrypt.compare(nUser.strPassword, User.strPassword).then((isCorrect) => {
          // If the comparission result (isCorrect) is true...
          if (isCorrect) {

            // Get the User Object from mongoose and 
            // make it a JS Object
            nUser = User.toObject()

            // Delete all the no needed data
            delete nUser._id
            delete nUser.strPassword

            // Make the token from the User object
            jsonwebtoken.sign({ nUser }, 'SecretKey', (err, token) => {
              // Return the succes code, the user information and the token
              return res.status(201).json({
                user: nUser,
                token: token
              });
            });

            // If the password is wrong...
          } else {
            // Return the error code
            return res.status(401).json({
              message: "ERROR: Wrong password"
            });
          }
        });

        // If there is no User with that email...
      } else {
        // Send the error message and code
        return res.status(404).json({
          message: `ERROR: There is no user with the email ${nUser.strEmail}`
        });
      }
    });
});


// Function to follow another user
app.post('/api/user/Follow', verifyToken, (req, res) => {
  // To verify the JWT
  jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {
    // Check that it is logged in
    if (!err) {

      // Check if the user is not trying to follow himnself
      if (authData.nUser['strUserName'] != req.query.UserToFollow) {

        // Check if Uset to follow exists
        UsersModel.findOne({ strUserName: req.query.UserToFollow },
          ['strUserName', 'imgProfile', 'strEmail', 'arrFollowers'])
          .exec((err, toFollow) => {

            // Variable to know the follow proccess end correctly
            let bFollowing = true;

            // Check if the following user exists
            if (toFollow) {

              // To check if the user is not already following the toFollow user
              if (!searchInFollowers(toFollow.arrFollowers, authData.nUser['strUserName'])) {

                // Push the new follower object to the ToFollow User
                UsersModel.findOneAndUpdate(
                  { strEmail: toFollow.strEmail },
                  { $push: { 'arrFollowers': authData.nUser } },

                  // What to do after de update 
                  // (It is needed to the update finish correctly)
                  function (err, doc) { if (err) { bFollowing = false; } }
                );

                // Push the new following object to the Following User
                UsersModel.findOneAndUpdate(
                  { strEmail: authData.nUser['strEmail'] },
                  { $push: { 'arrFollowing': toFollow } },

                  // What to do after de update 
                  // (It is needed to the update finish correctly)
                  function (err, doc) { if (err) { bFollowing = false; } }
                );

                // Check if the objects were 
                // add correctly to the databases
                if (bFollowing) {

                  // Return the succes code, the user information and the token
                  return res.status(201)
                    .json({ message: `Following ${req.query.UserToFollow}` });
                }

                // If the user already follows the toFollow user...
              } else {
                // Send the error message and code
                return res.status(401)
                  .json({ message: `Already following ${toFollow.strUserName}` });
              }

              // If the toFollor user does not exist
            } else {
              // Return the error code
              return res.status(404)
                .json({ message: "User not found" });
            }
          });

        // If the user try to follow himself
      } else {
        // Return the error message
        return res.status(403)
          .json({ message: "You can not follow yourself" });
      }

    } else {
      // Send the error message and code
      return res.status(401)
        .json({ message: `No logged in` });
    }
  })
});