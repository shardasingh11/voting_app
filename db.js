const mongoose = require('mongoose');
require('dotenv').config();


const mongoURL = process.env.MONGODB_URL_LOCAL;

//setup mongodb connection
mongoose.connect(mongoURL);

const db = mongoose.connection;

// Define event listeners for database connection
db.on('connected', ()=>{
    console.log('Connected to the MongoDB server');
});

db.on('disconnected', ()=>{
    console.log('MongoDB disconnected');
});

db.on('error', (err)=>{
    console.log('MongoDB connection error', err);
});

module.exports = db;