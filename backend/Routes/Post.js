// Import NodeJS Modules
const express = require('express');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const multer = require('multer');
const fs = require("fs");

// Import Project models
const PostModel = require('../Models/Posts.js');
const UserModel = require('../Models/Users.js');

// Valid extension
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif'
};

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
 * Function that returns a query with the post of a given user
 * 
 * @param {String} userID  The ID of the user you want the posts from
 * @param {Int} Count  Number of objects you want it to return
 * @param {Int} Page   Number of pagination
 * @param {Array} parameters Array with the attr you want it to return 
 *                          (If all, do not add this parameter)
 */
function getPosts(userID, Count, Page, parameters = null) {
    // Check if User to follow exists
    let result = PostModel.find({ strAuthorID: userID }, parameters)
        .skip(Count * Page)
        .limit(parseInt(Count))
        .sort('-datePublished');

    return result;
}


/**
 * Function to get the query about certain user
 *
 * @param {String} userID User name of the user
 * @param {Array} parameter Attr you want to receive (If wants all, do not send this parameter)
 */
function getUserInfo(userID, parameter = null) {
    // Check if User to follow exists
    let result = UserModel.findOne({ _id: userID },
        parameter
    );

    return result;
}


/**
 * To sort an array of objects
 * 
 * @param {String} Field The attr you want to sort by
 * @param {Boolean} Reverse If it is ascending or descending
 * @param {Operato} Primer 
 */
const sort_by = (Field, Reverse, Primer) => {

    // Get the how to compare
    const key = Primer ?
        function (X) {
            return Primer(X[Field])
        } :
        function (X) {
            return X[Field]
        };

    Reverse = !Reverse ? 1 : -1;

    return function (A, B) {
        return A = key(A), B = key(B), Reverse * ((A > B) - (B > A));
    }
}

// ################# Server functions #################
// Endpoint to make a post
router.post('/MakePost', verifyToken, (req, res, next) => {
    // Verify the User token
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {

        // If the token is valid...
        if (!err) {

            // Create the multer configuration variable
            const storage = multer.diskStorage({
                // Built the destination in disk of the uploaded images
                destination: (requ, file, cb) => {

                    // Check that the extension is valid
                    const isValid = MIME_TYPE_MAP[file.mimetype];
                    // If it returns nothing means the extension is not valid
                    if (!isValid) {
                        // Return the error code
                        return res.status(415).json({
                            message: "No supported file extension"
                        });
                    }


                    // Check that the destination file exists, if not...
                    if (!fs.existsSync('./backend/Post_Images/' + authData.nUser['strUserName'])) {
                        // Create the directory
                        fs.mkdirSync('./backend/Post_Images/' + authData.nUser['strUserName']);
                    }

                    // Set where to save it. Ej: ./backend/Post_Images/@username
                    cb(null, "./backend/Post_Images/" + authData.nUser['strUserName']);
                },
                // Format the image name 
                filename: (requ, file, cb) => {
                    // Take the origianl name, pass all to lower case and replace blanckspaces with -
                    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
                    // Get the file extension
                    const ext = MIME_TYPE_MAP[file.mimetype];
                    // Set the file name
                    cb(null, name + '-' + Date.now() + '.' + ext);
                }
            });

            // Set the Upload middleware variable
            let UploadImage = multer({ storage: storage }).array("image", 5);

            // Execute the middleware
            UploadImage(req, res, function (error) {

                // If there was no errors saving them...
                if (!error) {
                    // Get the post JSON
                    let postBody = req.body;

                    // Check if the server receive the date parameter
                    if (!postBody.datePublished) {
                        // Return the error code
                        return res.status(406).json({
                            message: "The date parameter is missing on the Post body"
                        });
                    }

                    // Check that the post has a description and/or media files
                    if (!postBody.strDescription && req.files.length == 0) {
                        // Return the error code
                        return res.status(406).json({
                            message: "You can not publish an empty post"
                        });
                    }

                    // Array to append the images path
                    let arrMedia = []

                    // Check if the user upload images
                    if (req.files.length > 0) {

                        // Push each image filename to the array
                        req.files.forEach(file => {
                            arrMedia.push(file.filename)
                        });
                    }

                    // Ensure the indexes were created in order to them be unique
                    PostModel.init().then(() => {

                        // Create the new post model
                        let newPost = new PostModel({
                            strAuthorID: authData.nUser['_id'],
                            datePublished: postBody.datePublished,
                            strDescription: postBody.strDescription,
                            arrMedia: arrMedia
                            // Comments, likes are created by default as an empty array
                        });

                        // Save in the DB the new model
                        newPost.save()
                            .then(() => {
                                // If it was saved correctly send the message
                                return res.status(201)
                                    .json({ message: "Post published correctly!" });

                            }).catch((er) => {
                                // If not, send the error message and code
                                return res.status(500)
                                    .json({ message: 'Error saving the post' });
                            })
                    });

                    // If there was an error saving the images
                } else {
                    // Return the error code
                    return res.status(500)
                        .json({ message: "Error saving the images" });
                }
            });

            // If the user is not logged in 
        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `Not logged in` });
        }
    });
});


// To get the list of 
router.get('/GetPost/:postID', (req, res, next) => {

    let missingAttr = null      // Var to get if a attr is missing

    // Check if a parameter is missing
    if (!req.query.Page) { missingAttr = "Page" }
    if (!req.query.Count) { missingAttr = "Count" }

    // Verify the request include the userID
    if (missingAttr) {
        // Return the error code
        return res.status(406).json({
            message: `The ${missingAttr} parameter is missing`
        });
    }

    // Get the post information
    PostModel.findById(req.params.postID)
        .then((postObject) => {

            if (postObject) {
                // Get the current user arr of following accounts
                let postComments = postObject['arrComments'];
                // Temporal to concat the posts
                let arrToAppend = []

                // Iterate through the following users
                postComments.forEach((commentObj, index) => {

                    // Get the post from all of them
                    UserModel.findById({ _id: commentObj.strAuthorID })
                        .exec((err, authorData) => {

                            // If everything is fine...
                            if (!err) {
                                // Make the comment (mongoose obj) to a writable obj
                                let tempObj = commentObj.toObject()

                                // Built the server url
                                const url = req.protocol + '://' + req.get("host");

                                // Built the image path
                                const path = url + '/Post_Images/' + authorData.strUserName + '/'

                                // Complete the user data
                                let authorObj = {
                                    strUserName: authorData.strUserName,
                                    strName: authorData.strName,
                                    imgProfile: path + authorData.imgProfile,
                                    strAuthorID: authorData._id
                                }

                                tempObj['authorObj'] = authorObj;

                                // Add the comment to the array
                                arrToAppend.push(tempObj)

                                // If it get the data of all the comments
                                if (arrToAppend.length === postComments.length) {

                                    // Calculate the number of users to send
                                    let iBegin = parseInt(req.query.Page) * parseInt(req.query.Count);
                                    let iFinal = iBegin + parseInt(req.query.Count);

                                    // Sort the array by date
                                    let newArr = arrToAppend.sort(function (a, b) {
                                        return new Date(b.datePublished) - new Date(a.datePublished);
                                    });

                                    // Get the array part by pagination
                                    newArr = newArr.slice(iBegin, iFinal)

                                    // Sort by the date
                                    newArr = newArr.sort(sort_by('datePublished', true, Date));

                                    // Return the final array
                                    return res.status(200).json({
                                        bEnd: (iFinal > newArr.length),
                                        commentsResult: newArr
                                    });
                                }

                            } else {
                                // If there was an error at the query execution
                                return res.status(500)
                                    .json({ message: "Error" })
                            }
                        });
                });

                // If the post do not exists
            } else {
                return res.status(404)
                    .json({ message: "Post not found" })
            }
        })
        // If the query has an error
        .catch((err) => {
            return res.status(500)
                .json({ message: "Error" })
        });
});


// Get all the posts from one user
router.get('/GetPosts', (req, res, next) => {

    let missingAttr = null      // Var to get if a attr is missing

    // Check if a parameter is missing
    if (!req.query.userID) { missingAttr = "userID" }
    if (!req.query.Page) { missingAttr = "Page" }
    if (!req.query.Count) { missingAttr = "Count" }

    // Verify the request include the userID
    if (missingAttr) {
        // Return the error code
        return res.status(406).json({
            message: `The ${missingAttr} parameter is missing`
        });
    }

    // Make the query to know if the user exists
    let userQuery = getUserInfo(req.query.userID);

    // Execute the query
    userQuery.exec((err, userData) => {

        // If the user exists
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
                jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {

                    // Check that it has the authentication data
                    if (!err) {
                        // Make the query to get the posts of that user
                        let postsQuery = getPosts(req.query.userID, req.query.Count, req.query.Page);

                        // Execute the query
                        postsQuery.exec((erro, postData) => {

                            // If everything was fine...
                            if (!erro) {
                                // To append the array of posts to send
                                let formatPosts = []

                                if (postData.length > 0) {
                                    // Built the server url
                                    const url = req.protocol + '://' + req.get("host");

                                    // Built the image path
                                    const path = url + '/Post_Images/' + userData.strUserName + '/'

                                    postData.forEach((ele) => {

                                        let arrMedia = ele['arrMedia'].map((index) => {
                                            return path + index;
                                        });

                                        formatPosts.push({
                                            _id: ele._id,
                                            authorObj: {
                                                strAuthorID: ele.strAuthorID,
                                                strAuthorUserName: userData.strUserName,
                                                strName: userData.strName,
                                                imgProfile: path + userData.imgProfile,
                                            },
                                            strDescription: ele.strDescription,
                                            datePublished: ele.datePublished,
                                            arrComments: ele.arrComments.length,
                                            arrLikes: ele.arrLikes.length,
                                            bLike: searchUserInStringArray(ele.arrLikes, authData.nUser['_id']),
                                            arrMedia
                                        })
                                    });
                                }

                                // Return the success code and the array
                                return res.status(201)
                                    .json({
                                        bEnd: (formatPosts.length < req.query.Count),
                                        userPosts: formatPosts
                                    });

                            } else {
                                // Return the error code
                                return res.status(500)
                                    .json({ message: "Error getting the posts" });
                            }
                        });
                    }
                });
            } else {

                // Make the query to get the posts of that user
                let postsQuery = getPosts(req.query.userID, req.query.Count, req.query.Page);

                // Execute the query
                postsQuery.exec((erro, postData) => {

                    // If everything was fine...
                    if (!erro) {
                        // To append the array of posts to send
                        let formatPosts = []

                        if (postData.length > 0) {
                            // Built the server url
                            const url = req.protocol + '://' + req.get("host");

                            // Built the image path
                            const path = url + '/Post_Images/' + userData.strUserName + '/'

                            postData.forEach((ele) => {

                                let arrMedia = ele['arrMedia'].map((index) => {
                                    return path + index;
                                });

                                formatPosts.push({
                                    _id: ele._id,
                                    authorObj: {
                                        strAuthorID: ele.strAuthorID,
                                        strAuthorUserName: userData.strUserName,
                                        strName: userData.strName,
                                        imgProfile: path + userData.imgProfile,
                                    },
                                    strDescription: ele.strDescription,
                                    datePublished: ele.datePublished,
                                    arrComments: ele.arrComments.length,
                                    arrLikes: ele.arrLikes.length,
                                    bLike: false,
                                    arrMedia
                                })
                            });
                        }

                        // Return the success code and the array
                        return res.status(201)
                            .json({
                                bEnd: (formatPosts.length < req.query.Count),
                                userPosts: formatPosts
                            });

                    } else {
                        // Return the error code
                        return res.status(500)
                            .json({ message: "Error getting the posts" });
                    }
                });
            }
            // If the user does not exist
        } else {
            return res.status(404)
                .json({ message: "The user does not exist" });
        }
    });
});


// Get posts of all the user you follow and send it to show at the wall
router.get('/Wall', verifyToken, (req, res, nect) => {

    // Verify the User token
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {
        // Check it the user is logged correctly
        if (!err) {
            let missingAttr = null    // Var to get if a attr is missing

            // Check if the server receive all the parameters
            if (!req.query.Page) { missingAttr = "Page" }
            if (!req.query.Count) { missingAttr = "Count" }

            // Check that the parameter exists
            if (missingAttr) {
                // Return the error code
                return res.status(406).json({
                    message: `The ${missingAttr} parameter is missing`
                });
            }

            // Make the query to get the user info
            let userQuery = getUserInfo(authData.nUser['_id']);

            // Check it the current user exists
            userQuery.exec((err, currentUser) => {

                // If it does...
                if (!err) {
                    // Get the current user arr of following accounts
                    let userFollowing = currentUser['arrFollowing'];

                    userFollowing.push(currentUser._id)

                    // Temporal to concat the posts
                    let arrToAppend = []

                    let tempArrUsers = []

                    if (userFollowing.length > 0) {

                        // Iterate through the following users
                        userFollowing.forEach((userID, index) => {

                            // Get the author 
                            UserModel.findById({ _id: userID })
                                .then((authorObject) => {

                                    // Get the post from all of them
                                    PostModel.find({ strAuthorID: authorObject._id })
                                        .sort('-datePublished')     // Sort by date

                                        .then((result) => {
                                            // To all the posts...
                                            let tempoArr = result.map((elem) => {
                                                let arrMedia = []

                                                // Built the server url
                                                const url = req.protocol + '://' + req.get("host");

                                                // Built the image path
                                                const path = url + '/Post_Images/' + authorObject['strUserName'] + '/'

                                                // If the post has images...
                                                if (elem['arrMedia'].length > 0) {
                                                    // Bulilt the complete path
                                                    arrMedia = elem['arrMedia'].map((index) => {
                                                        return path + index;
                                                    });
                                                }

                                                // Return the new post object
                                                return {
                                                    _id: elem._id,
                                                    authorObj: {
                                                        strAuthorID: elem.strAuthorID,
                                                        strAuthorUserName: authorObject.strUserName,
                                                        strName: authorObject.strName,
                                                        imgProfile: path + authorObject.imgProfile
                                                    },
                                                    strDescription: elem.strDescription,
                                                    datePublished: elem.datePublished,
                                                    arrComments: elem.arrComments.length,
                                                    arrLikes: elem.arrLikes.length,
                                                    bLike: searchUserInStringArray(elem.arrLikes, authData.nUser['_id']),
                                                    arrMedia
                                                }

                                            });
                                            tempArrUsers.push(authorObject)
                                            // Concat the posts
                                            arrToAppend = arrToAppend.concat(tempoArr);

                                            if (tempArrUsers.length === userFollowing.length) {
                                                // Calculate the number of users to send
                                                let iBegin = parseInt(req.query.Page) * parseInt(req.query.Count);
                                                let iFinal = iBegin + parseInt(req.query.Count);

                                                // Sort by date the array
                                                arrToAppend = arrToAppend.sort(function (a, b) {
                                                    return new Date(b.datePublished) - new Date(a.datePublished);
                                                });

                                                // Get the array part by pagination
                                                let newArr = arrToAppend.slice(iBegin, iFinal)

                                                // If it reach the final user, return the result array
                                                return res.status(200).json({
                                                    bEnd: (iFinal > newArr.length),
                                                    wallResult: newArr
                                                });
                                            }
                                        });
                                });
                        });
                    } else {
                        // Return the error code
                        return res.status(201)
                            .json({
                                bEnd: true,
                                wallResult: []
                            });
                    }


                } else {
                    // Return the error code
                    return res.status(404)
                        .json({ message: "User not found" });
                }
            });

        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `Not logged in` });
        }
    });
});


// Get posts of all the user you follow and send it to show at the wall
router.get('/Wall', verifyToken, (req, res, nect) => {

    // Verify the User token
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {
        // Check it the user is logged correctly
        if (!err) {
            let missingAttr = null    // Var to get if a attr is missing

            // Check if the server receive all the parameters
            if (!req.query.Page) { missingAttr = "Page" }
            if (!req.query.Count) { missingAttr = "Count" }

            // Check that the parameter exists
            if (missingAttr) {
                // Return the error code
                return res.status(406).json({
                    message: `The ${missingAttr} parameter is missing`
                });
            }

            // Make the query to get the user info
            let userQuery = getUserInfo(authData.nUser['_id']);

            // Check it the current user exists
            userQuery.exec((err, currentUser) => {

                // If it does...
                if (!err) {
                    // Get the current user arr of following accounts
                    let userFollowing = currentUser['arrFollowing'];
                    // Temporal to concat the posts
                    let arrToAppend = []

                    let tempArrUsers = []

                    if (userFollowing.length > 0) {

                        // Iterate through the following users
                        userFollowing.forEach((userID, index) => {

                            // Get the author 
                            UserModel.findById({ _id: userID })
                                .then((authorObject) => {

                                    // Get the post from all of them
                                    PostModel.find({ strAuthorID: authorObject._id })
                                        .sort('-datePublished')     // Sort by date

                                        .then((result) => {
                                            // To all the posts...
                                            let tempoArr = result.map((elem) => {
                                                let arrMedia = []

                                                // Built the server url
                                                const url = req.protocol + '://' + req.get("host");

                                                // Built the image path
                                                const path = url + '/Post_Images/' + authData.nUser['strUserName'] + '/'

                                                // If the post has images...
                                                if (elem['arrMedia'].length > 0) {
                                                    // Bulilt the complete path
                                                    arrMedia = elem['arrMedia'].map((index) => {
                                                        return path + index;
                                                    });
                                                }

                                                // Return the new post object
                                                return {
                                                    _id: elem._id,
                                                    authorObj: {
                                                        strAuthorID: elem.strAuthorID,
                                                        strAuthorUserName: authorObject.strUserName,
                                                        strName: authorObject.strName,
                                                        imgProfile: path + authorObject.imgProfile
                                                    },
                                                    strDescription: elem.strDescription,
                                                    datePublished: elem.datePublished,
                                                    arrComments: elem.arrComments.length,
                                                    arrLikes: elem.arrLikes.length,
                                                    bLike: searchUserInStringArray(elem.arrLikes, authData.nUser['_id']),
                                                    arrMedia
                                                }

                                            });
                                            tempArrUsers.push(authorObject)
                                            // Concat the posts
                                            arrToAppend = arrToAppend.concat(tempoArr);

                                            if (tempArrUsers.length === userFollowing.length) {
                                                // Calculate the number of users to send
                                                let iBegin = parseInt(req.query.Page) * parseInt(req.query.Count);
                                                let iFinal = iBegin + parseInt(req.query.Count);

                                                // Sort by date the array
                                                arrToAppend = arrToAppend.sort(function (a, b) {
                                                    return new Date(b.datePublished) - new Date(a.datePublished);
                                                });

                                                // Get the array part by pagination
                                                let newArr = arrToAppend.slice(iBegin, iFinal)

                                                // If it reach the final user, return the result array
                                                return res.status(200).json({
                                                    bEnd: (iFinal > newArr.length),
                                                    wallResult: newArr
                                                });
                                            }
                                        });
                                });
                        });
                    } else {
                        // Return the error code
                        return res.status(201)
                            .json({
                                bEnd: true,
                                wallResult: []
                            });
                    }


                } else {
                    // Return the error code
                    return res.status(404)
                        .json({ message: "User not found" });
                }
            });

        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `Not logged in` });
        }
    });
});


// Make a like post
router.put('/Like', verifyToken, (req, res, next) => {
    // Verify the User token
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {
        if (!err) {

            // Verifiy that the query has the Post ID, if not...
            if (!req.query.postID) {
                // Return the error code
                return res.status(406).json({
                    message: "The postID is missing on the Post body"
                });
            }

            // Check if the post exists
            PostModel.findOne({ _id: req.query.postID }, ['arrLikes'])
                .exec((err, toLike) => {
                    if (toLike) {

                        // Search if the user already liked the post or not
                        if (!searchUserInStringArray(toLike['arrLikes'], authData.nUser['_id'])) {

                            // Pull the follower object from the toUnfollow user array of followers
                            PostModel.findOneAndUpdate(
                                { _id: req.query.postID },
                                { $push: { 'arrLikes': authData.nUser['_id'] } },

                                // What to do after de update 
                                // (It is needed to the update finish correctly)
                                function (err, doc) {
                                    if (!err) {
                                        // Return the succes code, the user information and the token
                                        return res.status(201)
                                            .json({ message: `Post liked!` });

                                    } else {
                                        // Return the error code
                                        return res.status(500)
                                            .json({ message: "Error saving the like" });
                                    }
                                }
                            );

                            // If the user already liked the post
                        } else {
                            // Send the error message and code
                            return res.status(401)
                                .json({ message: "You already like this post" });
                        }

                        // If the post does not exist
                    } else {
                        // Return the error code
                        return res.status(404)
                            .json({ message: "Post not found" });
                    }
                });


        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `Not logged in` });
        }
    });
});


// Make a like post
router.put('/Unlike', verifyToken, (req, res, next) => {

    // Verify the User token
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {
        if (!err) {

            // Verifiy that the query has the Post ID, if not...
            if (!req.query.postID) {
                // Return the error code
                return res.status(406).json({
                    message: "The postID is missing on the Post body"
                });
            }

            // Check if the post exists
            PostModel.findOne({ _id: req.query.postID }, ['arrLikes']).exec((err, toLike) => {

                // If the post exists..
                if (toLike) {
                    // Check if the user liked or not this post before
                    if (searchUserInStringArray(toLike['arrLikes'], authData.nUser['_id'])) {

                        // Pull the follower object from the toUnfollow user array of followers
                        PostModel.findOneAndUpdate(
                            { _id: req.query.postID },
                            { $pull: { 'arrLikes': authData.nUser['_id'] } },

                            // Callback function
                            function (err, doc) {

                                // If there was no error...
                                if (!err) {
                                    // Return the succes code, the user information and the token
                                    return res.status(201)
                                        .json({ message: `Post Unliked!` });

                                    // If there was an error...
                                } else {
                                    // Return the error code
                                    return res.status(500)
                                        .json({ message: "Error saving the unlike" });
                                }
                            }
                        );

                        // If the user did not liked the post previusly
                    } else {
                        // Send the error message and code
                        return res.status(401)
                            .json({ message: "You did not liked this post" });
                    }

                    //  If the post id is incorrect
                } else {
                    // Return the error code
                    return res.status(404)
                        .json({ message: "Post not found" });
                }
            });

            // If the user is not logged in 
        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `Not logged in` });
        }
    });
});


// To register a comment in a post
router.put('/MakeComment', verifyToken, (req, res, next) => {
    // Verify the User token
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {

        // If everything was fine...
        if (!err) {
            let reqBody = req.body;     // Get the JSON
            let missingAttr = null      // Var to get if a attr is missing

            // Check if a parameter is missing
            if (!reqBody.strComment) { missingAttr = "strComment" }
            if (!reqBody.datePublished) { missingAttr = "datePublished" }
            if (!reqBody.postID) { missingAttr = "postID" }

            // Check if there was any missing parameter
            if (missingAttr) {
                // Return the error code
                return res.status(406).json({
                    message: `The ${missingAttr} parameter is missing`
                });
            }

            // Check if the post exists
            PostModel.findOne({ _id: reqBody.postID }, ['arrComments']).exec((err, toComment) => {

                // If the post exists..
                if (toComment) {

                    let newComment = {
                        datePublished: authData.nUser['_id'],
                        strAuthorID: authData.nUser['_id'],
                        strComment: reqBody.strComment,
                        datePublished: reqBody.datePublished
                    }

                    // Pull the follower object from the toUnfollow user array of followers
                    PostModel.findOneAndUpdate(
                        { _id: reqBody.postID },
                        { $push: { 'arrComments': newComment } },

                        // Callback function
                        function (err, doc) {

                            // If there was no error...
                            if (!err) {
                                // Return the succes code, the user information and the token
                                return res.status(201)
                                    .json({ message: `Comment publisehd!` });

                                // If there was an error...
                            } else {
                                // Return the error code
                                return res.status(500)
                                    .json({ message: "Error publishing the comment" });
                            }
                        }
                    );

                    //  If the post id is incorrect
                } else {
                    // Return the error code
                    return res.status(404)
                        .json({ message: "Post not found" });
                }
            });

            // If the user is not logged in 
        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `Not logged in` });
        }
    });
});


// To get the list of 
router.get('/Likes/:postID', (req, res, next) => {

    // Get the post information
    PostModel.findById(req.params.postID)
        .then((postObject) => {

            if (postObject) {
                // Get the current user arr of following accounts
                let postComments = postObject['arrLikes'];
                // Temporal to concat the likes users
                let arrToAppend = []

                // Iterate through the users that leave a like
                postComments.forEach((strAuthorID, index) => {

                    // Get the user data
                    UserModel.findById({ _id: strAuthorID })
                        .exec((err, authorData) => {

                            // If everything is fine...
                            if (!err) {
                                // Temporal obj
                                let tempObj = {}

                                // Built the server url
                                const url = req.protocol + '://' + req.get("host");

                                // Built the image path
                                const path = url + '/Post_Images/' + authorData.strUserName + '/'

                                // Complete the user data
                                tempObj['strName'] = authorData.strName
                                tempObj['imgProfile'] = path + authorData.imgProfile
                                tempObj['strAuthorID'] = authorData._id

                                // Add the comment to the array
                                arrToAppend.push(tempObj)

                                // If it get the data of all the comments
                                if (arrToAppend.length === postComments.length) {

                                    // Return the final array
                                    return res.status(200).json({
                                        likesResult: arrToAppend
                                    });
                                }

                            } else {
                                // If there was an error at the query execution
                                return res.status(500)
                                    .json({ message: "Error" })
                            }
                        });
                });

                // If the post do not exists
            } else {
                return res.status(404)
                    .json({ message: "Post not found" })
            }
        })
        // If the query has an error
        .catch((err) => {
            return res.status(404)
                .json({ message: "Post not found" })
        });
});


// Export the enpoints
module.exports = router;