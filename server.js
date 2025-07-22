const express = require('express');
const app = express();

require('dotenv').config();
const db = require('./db');

const bodyParser = require('body-parser');
app.use(bodyParser.json()); //convert the request body data into object then store in the req.body

app.get('/' ,function(req, res){
    res.send("Welcome to a Voating System!");
});

//Import the routes file
const userRoutes = require('./routes/userRoutes');

//use the routes
app.use('/user', userRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("listening on port 3000");
});
