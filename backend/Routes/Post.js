// Import NodeJS Modules
const express = require('express');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const multer = require('multer');
const fs = require("fs");

// Import Project models
const PostModel = require('../Models/Posts.js');

// Valid extension
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
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
                    return res.status(500).json({
                        message: "Error saving the images"
                    });
                }
            });

            // If the user is not logged in 
        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `No logged in` });
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
                    message: "The date parameter is missing on the Post body"
                });
            }

            // Check if User to follow exists
            PostModel.findOne({ _id: req.query.postID },
                ['arrLikes'])
                .exec((err, toLike) => {
                    if (toLike) {

                        if (!searchUserInStringArray(toLike['arrLikes'], authData.nUser['_id'])) {

                            // Pull the follower object from the toUnfollow user array of followers
                            PostModel.findOneAndUpdate(
                                { _id: req.query.postID },
                                { $push: { 'arrLikes': authData.nUser['_id'] } },

                                // What to do after de update 
                                // (It is needed to the update finish correctly)
                                function (err, doc) {
                                    if (err) {
                                        // Return the error code
                                        return res.status(500)
                                            .json({ message: "Error saving the like" });
                                    } else {
                                        // Return the succes code, the user information and the token
                                        return res.status(201)
                                            .json({ message: `Post liked!` });
                                    }
                                }
                            );

                        } else {
                            // Send the error message and code
                            return res.status(401)
                                .json({ message: "You already like this post" });
                        }

                    } else {
                        // Return the error code
                        return res.status(404)
                            .json({ message: "Post not found" });
                    }
                });


        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `No logged in` });
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
                    message: "The date parameter is missing on the Post body"
                });
            }

            // Check if User to follow exists
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
                .json({ message: `No logged in` });
        }
    });
});


// Export the enpoints
module.exports = router;