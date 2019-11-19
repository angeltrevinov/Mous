// Imports
const mongoose = require('mongoose');

/**
 * Scheme to define the information about the auhtor of a post, comment or like
 *      strUserName:  The user name of the post author
 *      imgProfile:     The name of the profile image
 */


/**
 * Scheme to store the information of commentaries
 *      objAuthor:      The information of the comment author
 *      strComment:     The comment itself
 *      datePublished:  Date the comment was published
 */
const Comments = new mongoose.Schema({
    strAuthor: { type: String, required: true },
    strComment: { type: String, required: true },
    datePublished: { type: Date, required: true },
});


/**
 * Scheme of a Post
 *      objAuthor:      Information of the post author
 *      strDescription: The description the author write to the post
 *      datePublished:  Date the post was made
 *      arrMedia:       Array of names with the media the user published
 *      arrComments:    Array of comment schemas
 *      arrLikes:       Array of author schemas
 */
const postSchema = mongoose.Schema({
    strAuthor: { type: String, required: true },
    strDescription: { type: String, required: false, default: null },
    datePublished: { type: Date, required: true },
    arrMedia: [String],
    arrComments: [Comments],
    arrLikes: [
        {type: String, required: true }
    ]
});


// Export the models with the respective Collection
module.exports = mongoose.model('Posts', postSchema);