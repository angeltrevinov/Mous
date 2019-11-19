// Import NodeJS Modules
const express = require('express');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const multer = require('multer');
const fs = require("fs");

// Import Project models
const PostModel = require('../Models/Posts.js');

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


// ################# Server functions #################
router.post('/MakePost', verifyToken, (req, res, next) => {

    // Verify the token
    jsonwebtoken.verify(req.token, 'SecretKey', (err, authData) => {
        // If the token is validated correctly...
        if (!err) {

            const storage = multer.diskStorage({
                destination: (requ, file, cb) => {
                    // Check that the extension is valid
                    const isValid = MIME_TYPE_MAP[file.mimetype];

                    if (!isValid) {
                        // Return the error code
                        return res.status(415).json({
                            message: "No supported file extension"
                        });
                    }


                    // Check that its post directory does not exists
                    if (!fs.existsSync('./backend/Post_Images/' + authData.nUser['strUserName'])) {
                        // Create the directory
                        fs.mkdirSync('./backend/Post_Images/' + authData.nUser['strUserName']);
                    }

                    // Where to save it
                    cb(null, "./backend/Post_Images/" + authData.nUser['strUserName']);
                },
                filename: (requ, file, cb) => {
                    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
                    const ext = MIME_TYPE_MAP[file.mimetype];
                    cb(null, name + '-' + Date.now() + '.' + ext);
                }
            });

            let UploadImage = multer({ storage: storage }).array("image", 5);


            UploadImage(req, res, function (err) {
                if (!err) {
                    let postBody = req.body;    // Get the post JSON

                    postBody.datePublished = new Date(); // Tempo

                    // Check if the server receive the date parameter
                    if (!postBody.datePublished) {
                        // Return the error code
                        return res.status(406).json({
                            message: "The date parameter is missing on the Post body"
                        });
                    }

                    // Check that the post has a description and/or media
                    if (!postBody.strDescription && req.files.length == 0) {
                        // Return the error code
                        return res.status(406).json({
                            message: "You can not publish an empty post"
                        });
                    }

                    let objAuthor = {
                        strUserName: authData.nUser['strUserName'],
                        imgProfile: authData.nUser['imgProfile']
                    }

                    if(!postBody.strDescription){
                        postBody.strDescription = null
                    }

                    let arrMedia = []

                    if (req.files.length > 0) {
                        const url = req.protocol + '://' + req.get("host");


                        req.files.forEach(file => {
                            arrMedia.push(url + '/Post_Images/' + authData.nUser['strUserName'] + '/' + file.filename)
                        });
                    }

                    let newPost = new PostModel({
                        objAuthor: objAuthor,
                        datePublished: postBody.datePublished,
                        strDescription: postBody.strDescription,
                        arrMedia: arrMedia
                    });

                    console.log(newPost.datePublished);

                    return res.status(201).json({
                        message: "Post published correctly!",
                        newPost: {
                            objAuthor: newPost.objAuthor,
                            datePublished: newPost.datePublished,
                            strDescription: newPost.strDescription,
                            arrMedia: newPost.arrMedia,
                            intLikes: 0,
                            intComments: 0,
                            arrLikes: newPost.arrLikes,
                            arrComments: newPost.arrComments
                        }
                    });



                } else {
                    console.log(err)
                    // Return the error code
                    return res.status(500).json({
                        message: "Error saving the images"
                    });
                }
            });


            // If not...
        } else {
            // Send the error message and code
            return res.status(401)
                .json({ message: `No logged in` });
        }
    });
});



// Export the enpoints
module.exports = router;


// let postBody = req.body;    // Get the post JSON

// console.log(req)

// // Check if the server receive the date parameter
// if (!postBody.datePublished) {
//     // Return the error code
//     return res.status(406).json({
//         message: "The date parameter is missing on the Post body"
//     });
// }


// // Check that the post has a description and/or media
// if (!postBody.strDescription) {
//     // Return the error code
//     return res.status(406).json({
//         message: "You can not publish an empty post"
//     });
// }

// console.log(req.file);




// let objAuthor = {
//     strUserName: authData.nUser['strUserName'],
//     imgProfile: authData.nUser['imgProfile']
// }

// const url = req.protocol + '://' + req.get("host");


// const newPost = new PostModel({
//     objAuthor: objAuthor,
//     datePublished: req.datePublished,
//     strDescription: req.strDescription,
//     imgPath: url + '/Post_Images/' + req.file.filename,
// })

// // Return the error code
// return res.status(201).json({
//     message: "Post published correctly!",
//     newPost: {
//         objAuthor: newPost.objAuthor,
//         datePublished: newPost.datePublished,
//         strDescription: newPost.strDescription,
//         imgPath: newPost.imgPath,
//         intLikes: 0,
//         intComments: 0,
//         arrLikes: newPost.arrLikes,
//         arrComments: newPost.arrComments
//     }
// });