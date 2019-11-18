// Import NodeJS Modules
const express = require('express');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

// Import Project models
const UsersModel = require('../Models/Users.js');

// Express app
const router = express.Router();

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
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
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


/**
 * Function to filter the users by the user name
 * 
 * @param {String}  toSearch Word you want to filter by
 * @param {Integer} ByParameter Integer to know if the search is by User name (1) or by Name
 */
function searchUsers(toSearch, ByParameter) {

    let result; // Query result

    // Check if is a search by User Name
    if (ByParameter == 1) {
        // Get all the non followers/following users
        result = UsersModel.find(
            { strUserName: { $regex: toSearch, $options: 'i' } },
            ['strName', 'strUserName', 'imgProfile', 'strDescription']);

        // Or if it is a search by Name
    } else {
        result = UsersModel.find(
            { strName: { $regex: toSearch, $options: 'i' } },
            ['strName', 'strUserName', 'imgProfile', 'strDescription']);
    }

    return result
}


/**
 * 
 * @param {Array} arrToFilter Array of objects you want to filter
 * @param {String} Attr Nombre del attributo por el que va a filtrar
 */
function filterObjectArray(arrToFilter, Attr) {
    const Checked = new Set();

    const filteredArr = arrToFilter.filter(el => {
        const duplicate = Checked.has(el[Attr]);
        Checked.add(el[Attr]);
        return !duplicate;
    });

    return filteredArr;
}


function getUserInfo(strUserName, parameter = null) {
    console.log(strUserName);

    // Check if User to follow exists
    let result = UsersModel.findOne({ strUserName: strUserName },
        //['strUserName', 'imgProfile', 'strEmail', 'arrFollowers'])
        parameter
    );

    return result;
}


// ################# Server functions #################
// Function to add a new User (Sign In)
router.post('/Signin', (req, res) => {
    let jsonUser = req.body   // Get the JSON body
    let missingAttr = null    // Var to get if a attr is missing

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

    if (jsonUser.strUserName[0] != '@') {
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


// Function to login
router.post('/Login', (req, res) => {
    let nUser = req.body      // Get the user body
    let missingAttr = null    // Var to get if a attr is missing

    // Check if a parameter is missing
    if (!nUser.strEmail) { missingAttr = "email" }
    if (!nUser.strPassword) { missingAttr = "password" }

    // Check if there was any missing parameter
    if (missingAttr) {
        // Return the error code
        return res.status(406).json({
            message: `The ${missingAttr} parameter is missing`
        });
    }

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
router.post('/Follow', verifyToken, (req, res) => {
    // To verify the JWT
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {
        // Check that it is logged in
        if (!err) {

            // Check the UserToFollow parameter exists
            if (!req.query.UserToFollow) {
                // Return the error code
                return res.status(406).json({
                    message: `The UserToFollow parameter is missing`
                });
            }

            // Check if the user is not trying to follow himnself
            if (authData.nUser['strUserName'] != req.query.UserToFollow) {

                // Check if User to follow exists
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


// Function to unfollow another user
router.post('/Unfollow', verifyToken, (req, res) => {
    // To verify the JWT
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {
        // Check that it is logged in
        if (!err) {

            // Check the UserToUnfollow parameter exists
            if (!req.query.UserToUnfollow) {
                // Return the error code
                return res.status(406).json({
                    message: `The UserToUnfollow parameter is missing`
                });
            }

            // Check if the user is not trying to unfollow himnself
            if (authData.nUser['strUserName'] != req.query.UserToUnfollow) {

                // Check if User to unFollow exists
                UsersModel.findOne({ strUserName: req.query.UserToUnfollow },
                    ['strUserName', 'imgProfile', 'strEmail', 'arrFollowers'])
                    .exec((err, toUnfollow) => {

                        // Variable to know the unfollow proccess end correctly
                        let bUnfollowing = true;

                        // Check if the toUnfollow user exists
                        if (toUnfollow) {

                            // To check if the user is following the toUnfollow user
                            if (searchInFollowers(toUnfollow.arrFollowers, authData.nUser['strUserName'])) {

                                // Pull the follower object from the toUnfollow user array of followers
                                UsersModel.findOneAndUpdate(
                                    { strEmail: toUnfollow.strEmail },
                                    { $pull: { 'arrFollowers': { strUserName: authData.nUser['strUserName'] } } },

                                    // What to do after de update 
                                    // (It is needed to the update finish correctly)
                                    function (err, doc) { if (err) { bUnfollowing = false; } }
                                );

                                // Pull the toUnfollow user from the following array 
                                UsersModel.findOneAndUpdate(
                                    { strEmail: authData.nUser['strEmail'] },
                                    { $pull: { 'arrFollowing': { strUserName: toUnfollow.strUserName } } },

                                    // What to do after de update 
                                    // (It is needed to the update finish correctly)
                                    function (err, doc) { if (err) { bUnfollowing = false; } }
                                );

                                // Check if the objects were pull correctly
                                if (bUnfollowing) {

                                    // Return the succes code, the user information and the token
                                    return res.status(201)
                                        .json({ message: `Unfollowing ${req.query.UserToUnfollow}` });
                                }

                                // If the user already follows the toUnfollow user...
                            } else {
                                // Send the error message and code
                                return res.status(401)
                                    .json({ message: `You are not a ${toUnfollow.strUserName} follower` });
                            }

                            // If the toUnFollow user does not exist
                        } else {
                            // Return the error code
                            return res.status(404)
                                .json({ message: "User not found" });
                        }
                    });

                // If the user try to unfollow himself
            } else {
                // Return the error message
                return res.status(403)
                    .json({ message: "You can not unfollow yourself" });
            }

        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `No logged in` });
        }
    })
});


// Function to search more users
router.get('/Search', (req, res, next) => {
    let missingAttr = null    // Var to get if a attr is missing

    // Check if the server receive all the parameters
    if (!req.query.toSearch) { missingAttr = "toSearch" }
    if (!req.query.Page) { missingAttr = "Page" }
    if (!req.query.Count) { missingAttr = "Count" }

    // Check that the parameter exists
    if (missingAttr) {
        // Return the error code
        return res.status(406).json({
            message: `The ${missingAttr} parameter is missing`
        });
    }

    // The word the users are filtered
    let toSearch = req.query.toSearch;

    // To append all the users
    let toAppend = []

    // Query that brings the users that begins with the toSearch variable
    let byArroba = searchUsers("@" + toSearch, 1);
    // Query that brings the users that contains the toSearch variable
    let byUserName = searchUsers(toSearch, 1);
    // Query that brings the users that contains the toSearch variable in its name
    let byName = searchUsers(toSearch, 2);

    // Execute the first query that search by the UserName but at the begining 
    byArroba.exec(function (err, Arrobas) {
        // Append the resulting array
        if (Arrobas) {
            toAppend = toAppend.concat(Arrobas)
        }

        // Execute the second query, search the users that include the word
        byUserName.exec(function (err, UserNames) {
            // Append the resulting array
            if (UserNames) {
                toAppend = toAppend.concat(UserNames)
            }

            // Executing the thid query, search the users thath include the word in the name
            byName.exec(function (err, Names) {
                // Append the resulting array
                toAppend = toAppend.concat(Names)

                // Delete duplicates
                toAppend = filterObjectArray(toAppend, 'strUserName');

                // Check if the current user is logged in
                if (typeof req.headers['authorization'] !== 'undefined') {
                    // Verify the token
                    // Split at the space
                    const bearer = req.headers['authorization'].split(' ');
                    // Get token from array
                    const bearerToken = bearer[1];
                    // Set the token
                    req.token = bearerToken;

                    // Verify the token
                    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {

                        // Check that it has the authentication data
                        if (authData) {

                            // Make the query to get the current user information
                            currentUser = getUserInfo(authData.nUser['strUserName']);
                            // Execute the query
                            currentUser.exec((err, curUser) => {

                                // Go through the toAppend array and check if the users are o not
                                // in the arrFollowing array of the current user
                                toAppend = toAppend.map(function (currentValue) {
                                    Tempo = currentValue.toObject();        // Pass from Mongoose object to JS object
                                    delete Tempo._id                        // Delete the id
                                    // Check if it is in the following array
                                    Tempo.bFollowing = searchInFollowers(curUser['arrFollowing'], Tempo.strUserName);
                                    return Tempo;
                                });

                                // Calculate the number of users to send
                                let iBegin = parseInt(req.query.Page) * parseInt(req.query.Count);
                                let iFinal = iBegin + parseInt(req.query.Count);

                                // Send the correct code and the array with the results
                                return res.status(200)
                                    .json({ searchResult: toAppend.slice(iBegin, iFinal) });
                            });
                        }
                    });


                    // If there is no user logged in
                } else {

                    // Delete duplicates
                    toAppend = filterObjectArray(toAppend, 'strUserName');

                    // Mar all the resul users as not following
                    toAppend = toAppend.map(function (currentValue) {
                        Tempo = currentValue.toObject();    // Pass it to a JS object
                        Tempo.bFollowing = false;           // Mark as no following
                        delete Tempo._id                    // Delete the _id attr
                        return Tempo;
                    });

                    // Calculate the number of users to send
                    let iBegin = parseInt(req.query.Page) * parseInt(req.query.Count);
                    let iFinal = iBegin + parseInt(req.query.Count);

                    // Send the correct code and the array with the results
                    return res.status(200).json({
                        searchResult: toAppend.slice(iBegin, iFinal)
                    });
                }

            })
        });
    });
});


// Export the enpoints
module.exports = router;