// Imports
const mongoose = require('mongoose');

/**
 * Schema with the information about the Followers/Following users
 *      strUserName:    Acoount name (@)
 *      imgProfile:     String with the name of the profile image 
 */
const Follow = new mongoose.Schema({
    strUserName: { type: String, required: true },
    imgProfile: {type: String, require: true}
});


/**
 * Schema with the User Information
 *      strUserName:    User account name (@)
 *      strName:        User name
 *      strEmail:       User e-mail
 *      strPassword:    Encrypted password
 *      strDescription: Optional description wrote by the user
 *      strLocation:    Optional user location
 *      imgBanner:      Name of the banner image
 *      intFollowers:   Number of followers
 *      arrFollowers:   Array with followers data (Follower schemes)
 *      intFollowing:   Number of accounts followed
 *      arrFollowing:   Array with information of the accounts followd (Follower schemes)
 */
const userSchema = mongoose.Schema({
    strUserName: { type: String, required: true }, @
    strName: { type: String, required: true },
    strEmail: { type: String, required: true },
    strPassword: { type: String, required: true },
    strDescription: { type: String, required: true },
    strLocation: { type: String, required: true },
    imgBanner: {type: String, require: true},
    intFollowers: { type: Number, required: true },
    arrFollowers: [Follow],
    intFollowing: { type: Number, required: true },
    arrFollowing: [Follow]
});

// Export the models with the respective Collection
module.exports = mongoose.model('User', userSchema);