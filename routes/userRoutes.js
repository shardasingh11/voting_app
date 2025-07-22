const express = require('express');
const router = express.Router();

const User = require('./../models/User');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


//POST method to create signup page
router.post('/signup', async (req, res) => {

    try{
        const data = req.body;

        //create a User document
        const newUser = new User(data);

        //Save the newUser to the database
        const response = await newUser.save();
        console.log('data saved');
        
         //create Payload
        const payload = {
            id: response.id
        };
        console.log(payload);
        //send token with response
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});


    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});

    }
});

router.post('/login', async (req, res) => {

    try{
        const {aadharCardNumber, password} = req.body;

        //find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});
        //if user does not exist with the given aadharCardNumber or password, return error.
        console.log("user", user);
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: "Invalid aadharCardNumber or password"});
        }

        //generate token
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        //return token as response
        res.json({token: token});

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});

    }

});

//Profile route
router.get('/profile',jwtAuthMiddleware, async (req, res) => {
    try{
        const user = req.user;
        const userId = user.id;
        const userProfile = await User.findById(userId);
        console.log("User Profile : ", userProfile);
        res.status(200).json({userProfile});
        
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
});

router.put('/profile/password',jwtAuthMiddleware, async (req, res) => {
    try{
         const userId = req.user.id //extract the userid from the token
        const {currentPassword, newPassword} = req.body;

        //check the user is present in db or not
        const user = await User.findById(userId);

        //if password does not match return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: "wrong current password"});
        }

        //update the current password with new one
        user.password = newPassword;
        await user.save();

        console.log("Password Updated");
        res.status(200).json({message: "Password updated successfully"});

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});

    }
   
})

module.exports = router;
