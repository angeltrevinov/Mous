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
mongoose.connect("mongodb+srv://ServerApp:GAJX3Xks967nzqd1@mous-cluster-qncgc.mongodb.net/MOUS-Cluster", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  // If everything was find, print the next message
  .then(() => {
    console.log('Connected to Data Base')

    // If there was an error, catch it and print it
  }).catch((err) => {
    console.log(err)
  });


// ################# Auxiliar functions #################



// ################# Server functions #################

// Start the server
app.listen('8080', () => {
  console.log("App running on localhost:8080");
});

// Function to add a new User (Sign In)
app.post('/api/signin', (req, res) => {
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
          // Return the succes code and messaeg
          .then(() => {
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
              if (dupAttr.includes("strUserName")) {
                dupAttr = "User Name"
              } else if (dupAttr.includes("strEmail")) {
                dupAttr = "Email"
              }

              // Send the error message and code
              return res.status(500).json({
                message: `ERROR: The ${dupAttr} already exist`
              });
            }
          });
      });
    });
  });
});

// Function to log in
app.post('/api/login', (req, res) => {
  // Get the user body
  let nUser = req.body

  // Check if there is a User with that email
  UsersModel.findOne({ strEmail: nUser.strEmail },
    // And just bring the name, user name, profile image and the password
    ['strName', 'strUserName', 'imgProfile', 'strPassword']).exec(function (err, User) {

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
              return res.status(200).json({
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