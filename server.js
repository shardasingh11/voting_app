const express = require('express');
const app = express();

// require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json()); //convert the request body data into object then store in the req.body


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("listening on port 3000");
});
