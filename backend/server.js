// Import NodeJS Modules
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');

// Import Project models
const UsersModel = require('./Models/Users');

// Setting the app
const app = express();
app.use(bodyparser.json());

// Make the connection with the MongoDB
mongoose.connect("mongodb+srv://ServerApp:GAJX3Xks967nzqd1@mous-cluster-qncgc.mongodb.net/MOUS-Cluster")
  // If everything was find, print the next message
  .then(() => {
    console.log('Connected to Data Base')

  // If there was an error, catch it and print it
  }).catch((err) => {
    console.log(err)
  });