// Import NodeJS Modules
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');


// Setting the app
const app = express();
app.use(bodyparser.json());

// Import Project models
const userRoutes = require('./Routes/User.js');


// Make the connection with the MongoDB
mongoose.connect("mongodb+srv://ServerApp:GAJX3Xks967nzqd1@mous-cluster-qncgc.mongodb.net/MOUS-Cluster", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
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
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});


// Start the server
app.listen('8080', () => {
  console.log("App running on localhost:8080");
});


// Use the user endpoints
app.use("/api/user", userRoutes);


// Export the web app
module.exports = app;