// Imports
const mongoose = require('mongoose');

/**
 * Schema with the User Information
 *      strUserName:    User account name (@)
 *      strName:        User name
 *      strEmail:       User e-mail
 *      strPassword:    Encrypted password
 *      strDescription: Optional description wrote by the user
 *      strLocation:    Optional user location
 *      imgBanner:      Name of the banner image
 *      imgProfile:     Name of the profile image
 *      arrFollowers:   Array with followers data (Follower schemes)
 *      arrFollowing:   Array with information of the accounts followd (Follower schemes)
 */
const userSchema = mongoose.Schema({
    strUserName: { type: String, required: true, index: {unique: true} },
    strName: { type: String, required: true },
    strEmail: { type: String, required: true, index: {unique: true} },
    strPassword: { type: String, required: true },
    strDescription: { type: String, required: false, default: null},
    strLocation: { type: String, required: false, default: null },
    imgBanner: { type: String, require: false, default: "bannerDefault.jpg" },
    imgProfile: { type: String, require: false, default: "profileDefault.jpg" },
    arrFollowers: [{
        strUserName: { type: String, required: true},
        imgProfile: { type: String, require: true } 
    }],
    arrFollowing: [{
        strUserName: { type: String, required: true},
        imgProfile: { type: String, require: true }
    }]
});

// Export the models with the respective Collection
module.exports = mongoose.model('User', userSchema);