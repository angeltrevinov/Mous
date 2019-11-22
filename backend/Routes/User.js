// Import NodeJS Modules
const express = require('express');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs')

// Import Project models
const UsersModel = require('../Models/Users.js');

// Improt confiig
const { SECRETKEY } = require('../../config.js');

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
 * Function to search if a given user name is in an array of usernames but in string format
 *
 * @param {Array} arrUsers An arry with the arrUsers object
 * @param {String} userName A string with the username you are looking
 */
function searchUserInStringArray(arrUsers, userName) {

    // Check if the username it is in that array
    if (arrUsers.find((elem) => { return (elem == userName) })) {
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
            ['strName', 'strUserName', 'imgProfile', 'strDescription', '_id']);

        // Or if it is a search by Name
    } else {
        result = UsersModel.find(
            { strName: { $regex: toSearch, $options: 'i' } },
            ['strName', 'strUserName', 'imgProfile', 'strDescription', '_id']);
    }

    return result
}


/**
 *
 * Delete duplicates from an array
 *
 * @param {Array} arrToFilter Array of objects you want to filter
 * @param {String} Attr Attr names you want to filter by
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


/**
 * Function to get the query about certain user
 *
 * @param {String} userID User name of the user
 * @param {Array} parameter Attr you want to receive (If wants all, do not send this parameter)
 */
function getUserInfo(userID, parameter = null) {

    // Check if User to follow exists
    let result = UsersModel.findOne({ _id: userID },
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

                        // Check that its post directory does not exists
                        if (!fs.existsSync('./backend/Post_Images/' + nUser.strUserName)) {
                            // Create the directory
                            fs.mkdirSync('./backend/Post_Images/' + nUser.strUserName);
                        }

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
        ['_id', 'strUserName', 'strPassword']).exec(function (err, User) {

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
                        delete nUser.strPassword

                        // Make the token from the User object
                        jsonwebtoken.sign({ nUser }, SECRETKEY, (err, token) => {
                            // Return the succes code, the user information and the token
                            return res.status(201).json({
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


// Get the user name and the profile image
router.get('/getLoginInfo', verifyToken, (req, res) => {

    // To verify the JWT
    jsonwebtoken.verify(req.token, SECRETKEY, (err, authData) => {
        // Check that it is logged in
        if (!err) {

            // Make the query
            const queryUser = getUserInfo(authData.nUser['_id'], ['strUserName', 'strName', 'imgProfile', '_id']);

            // Execute the query
            queryUser.exec((err, currentUser) => {

                // Built the server url
                const url = req.protocol + '://' + req.get("host");

                // Built the image path
                const path = url + '/Post_Images/' + currentUser.strUserName + '/' + currentUser.imgProfile

                // If everything was fine..
                if (currentUser) {
                    // Return the success code and the data
                    return res.status(201)
                        .json({
                            _id: currentUser._id,
                            strUserName: currentUser.strUserName,
                            strName: currentUser.strName,
                            imgProfile: path
                        });

                    // If there was an error..
                } else {
                    // Return the error code
                    return res.status(404)
                        .json({ message: "User not found" });
                }
            });

        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `No logged in` });
        }

    });

});


// Get all the info of a user
router.get('/Profile', (req, res) => {

    // Verify the request include the userID as a parameter
    if (!req.query.userID) {
        // Return the error code
        return res.status(406).json({
            message: `The userID parameter is missing`
        });
    }

    // Make the query
    let userQuery = getUserInfo(req.query.userID);

    // Execute the query to get the searched user
    userQuery.exec((err, searchUser) => {

        // If the user exists...
        if (!err) {

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
                jsonwebtoken.verify(req.token, SECRETKEY, (err, authData) => {

                    // Check that it has the authentication data
                    if (!err) {

                        // Make the query to get the current user information
                        currentUser = getUserInfo(authData.nUser['_id']);
                        // Execute the query
                        currentUser.exec((erro, curUser) => {

                            // If it is correct...
                            if (!erro) {

                                // Get if the current user follows or not the searchUser
                                let bFollowing = searchUserInStringArray(curUser['arrFollowing'], searchUser._id)

                                // Return the success code and the JSON with the user data
                                return res.status(201)
                                    .json({
                                        _id: searchUser._id,
                                        strUserName: searchUser.strUserName,
                                        strName: searchUser.strName,
                                        strDescription: searchUser.strDescription,
                                        imgProfile: searchUser.imgProfile,
                                        imgBanner: searchUser.imgBanner,
                                        strLocation: searchUser.strLocation,
                                        intFollowers: searchUser.arrFollowers.length,
                                        intFollowing: searchUser.arrFollowing.length,
                                        bFollowing
                                    });

                            // If there was an error searching the current user
                            } else {
                                // Return the error code
                                return res.status(401)
                                    .json({ message: "Authentication fail" })
                            }
                        });

                        // Return the error code
                    } else {
                        return res.status(401)
                            .json({ message: "Authentication fail" })
                    }
                });
            } else {
                // Return the success code and the JSON with the user data
                return res.status(201)
                    .json({
                        _id: searchUser._id,
                        strUserName: searchUser.strUserName,
                        strName: searchUser.strName,
                        strDescription: searchUser.strDescription,
                        imgProfile: searchUser.imgProfile,
                        imgBanner: searchUser.imgBanner,
                        strLocation: searchUser.strLocation,
                        intFollowers: searchUser.arrFollowers.length,
                        intFollowing: searchUser.arrFollowing.length,
                        bFollowing: false
                    });
            }

        // If the user it is looking for
        } else {
            // Return the error code
            return res.status(404)
                .json({ message: "User not found" });
        }
    });
});


// Function to follow another user
router.post('/Follow', verifyToken, (req, res) => {
    // To verify the JWT
    jsonwebtoken.verify(req.token, SECRETKEY, (err, authData) => {
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
            if (authData.nUser['_id'] != req.query.UserToFollow) {

                // Check if User to follow exists
                UsersModel.findOne({ _id: req.query.UserToFollow },
                    ['arrFollowers', '_id', 'strUserName'])
                    .exec((err, toFollow) => {

                        // Variable to know the follow proccess end correctly
                        let bFollowing = true;

                        // Check if the following user exists
                        if (toFollow) {

                            // To check if the user is not already following the toFollow user
                            if (!searchUserInStringArray(toFollow.arrFollowers, authData.nUser['_id'])) {

                                // Push the new follower object to the ToFollow User
                                UsersModel.findOneAndUpdate(
                                    { _id: toFollow._id },
                                    { $push: { 'arrFollowers': authData.nUser['_id'] } },

                                    // What to do after de update
                                    // (It is needed to the update finish correctly)
                                    function (err, doc) { if (err) { bFollowing = false; } }
                                );

                                // Push the new following object to the Following User
                                UsersModel.findOneAndUpdate(
                                    { _id: authData.nUser['_id'] },
                                    { $push: { 'arrFollowing': toFollow['_id'] } },

                                    // What to do after de update
                                    // (It is needed to the update finish correctly)
                                    function (err, doc) { if (err) { bFollowing = false; } }
                                );

                                // Check if the objects were
                                // add correctly to the databases
                                if (bFollowing) {

                                    // Return the succes code, the user information and the token
                                    return res.status(201)
                                        .json({ message: `Following ${toFollow.strUserName}` });
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
    jsonwebtoken.verify(req.token, SECRETKEY, (err, authData) => {
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
            if (authData.nUser['_id'] != req.query.UserToUnfollow) {

                // Check if User to unFollow exists
                UsersModel.findOne({ _id: req.query.UserToUnfollow },
                    ['_id', 'strUserName', 'arrFollowers'])
                    .exec((err, toUnfollow) => {

                        // Variable to know the unfollow proccess end correctly
                        let bUnfollowing = true;

                        // Check if the toUnfollow user exists
                        if (toUnfollow) {

                            // To check if the user is following the toUnfollow user
                            if (searchUserInStringArray(toUnfollow.arrFollowers, authData.nUser['_id'])) {

                                // Pull the follower object from the toUnfollow user array of followers
                                UsersModel.findOneAndUpdate(
                                    { _id: toUnfollow._id },
                                    { $pull: { 'arrFollowers': authData.nUser['_id'] } },

                                    // What to do after de update
                                    // (It is needed to the update finish correctly)
                                    function (err, doc) { if (err) { bUnfollowing = false; } }
                                );

                                // Pull the toUnfollow user from the following array
                                UsersModel.findOneAndUpdate(
                                    { _id: authData.nUser['_id'] },
                                    { $pull: { 'arrFollowing': toUnfollow._id } },

                                    // What to do after de update
                                    // (It is needed to the update finish correctly)
                                    function (err, doc) { if (err) { bUnfollowing = false; } }
                                );

                                // Check if the objects were pull correctly
                                if (bUnfollowing) {

                                    // Return the succes code, the user information and the token
                                    return res.status(201)
                                        .json({ message: `Unfollowing ${toUnfollow.strUserName}` });
                                }

                                // If the user is not following the toUnfollow user...
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
                    jsonwebtoken.verify(req.token, SECRETKEY, (err, authData) => {

                        // Check that it has the authentication data
                        if (!err) {

                            // Make the query to get the current user information
                            currentUser = getUserInfo(authData.nUser['_id']);
                            // Execute the query
                            currentUser.exec((err, curUser) => {

                                // Go through the toAppend array and check if the users are o not
                                // in the arrFollowing array of the current user
                                toAppend = toAppend.map(function (currentValue) {
                                    Tempo = currentValue.toObject();        // Pass from Mongoose object to JS object
                                    // Check if it is in the following array
                                    Tempo.bFollowing = searchUserInStringArray(curUser['arrFollowing'], Tempo._id);
                                    return Tempo;
                                });

                                // Calculate the number of users to send
                                let iBegin = parseInt(req.query.Page) * parseInt(req.query.Count);
                                let iFinal = iBegin + parseInt(req.query.Count);

                                let newArr = toAppend.slice(iBegin, iFinal)

                                // Send the correct code and the array with the results
                                return res.status(200)
                                    .json({
                                        bEnd: (iFinal >= toAppend.length),
                                        searchResult: newArr
                                    });
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
