const express = require('express');
const app = express();

require('dotenv').config();
const db = require('./db');

const bodyParser = require('body-parser');
app.use(bodyParser.json()); //convert the request body data into object then store in the req.body
const PORT = process.env.PORT || 3000;

//Import the routes file
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

//use the routes
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);




app.listen(PORT, ()=>{
    console.log("listening on port 3000");
});
