// Import NodeJS Modules
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')
const { DATABASE_URL } = require('../config.js');


// Setting the app
const app = express();
app.use(bodyparser.json());
app.use('/Post_Images', express.static(path.join('backend/Post_Images')));

// Import Project models
const userRoutes = require('./Routes/User.js');
const postRoutes = require('./Routes/Post.js');


// Make the connection with the MongoDB
mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  // If everything was find, print the next message
  .then(() => {
    console.log('Connected to Data Base')

    // If there was an error, catch it and print it
  }).catch((err) => {
    console.log(err)
  });


// ################# Server functions #################

//Set headers for the requests
//----------------------------------------------------------
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,Authorization,content-type,application/json');
  next();
});


// Start the server
app.listen(process.env.PORT || '8080', () => {
  console.log("App running on localhost:8080");
});


// Use the user endpoints
app.use("/api/user", userRoutes);

// Use the post endpoints
app.use("/api/post", postRoutes);

//Angular
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Export the web app
module.exports = app;
