const express = require('express');
const router = express.Router();

const Candidate = require('./../models/Candidate');
const User = require('./../models/user');
const {jwtAuthMiddleware} = require('./../jwt');

const checkAdminRole = async (userId) => {
    try{
        const user = await User.findById(userId);
        if(user.role === 'admin') 
            return true;
    }catch(err){
        return false;
    }
    

}

//POST route to add a candidate
router.post('/',jwtAuthMiddleware, async (req, res) => {

    try{
        //check role of user
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "Only Admin can access this route"});
        }
        const data = req.body; //Assuming the req body contains the candidate data

        //create a Candidate document
        const newCandiddate = new Candidate(data);

        //Save the newCandidate to the database
        const response = await newCandiddate.save();
        console.log('data saved');
        res.status(200).json({response: response});

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});

    }
});


//Update Cndidate Profile
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try{

        //check role of user
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: "Only Admin can access this route"});
        }

        const candidateId = req.params.candidateId; //Extract the candidate id from the req parameters
        const updatedCandidateData = req.body; //Updated data for the Candidate

        //check the user is present in db or not
        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData,{
            new: true,  //Return the updated document
            runValidators: true  //Run mongoose validation
        });

        //if candidate not exist with the given id , return error
        if(!response)
            return res.status(404).json({error: `Candidate not found with the given CandidateId: ${candidateId}`});

        console.log("Candidate data Updated");
        res.status(200).json(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});

    } 
});

//Delete route to candidate
router.delete('/:candidateId',jwtAuthMiddleware, async (req, res) => {
    try{

        //check role of user
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: "Only Admin can access this route"});
        }

        const candidateId = req.params.candidateId; //Extract the candidate id from the req parameters

        //check the user is present in db or not
        const response = await Candidate.findByIdAndDelete(candidateId);

        //if candidate not exist with the given id , return error
        if(!response)
            return res.status(404).json({error: `Candidate not found with the given CandidateId: ${candidateId}`});

        console.log("Candidate deleted");
        res.status(200).json(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});

    } 
});

// let's start voting
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    //no admin can vote
    //user can vote only once

    const candidateId = req.params.candidateId;
    const userId = req.user.id;

    try{
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message: "Candidate not found 👎"});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: "User not found 👎"});
        }

        if(user.isVoted){
            return res.status(400).json({message: "Sorry😒 You have already voted, can not vote again !"});
        }
        if(user.role === "admin"){
            return res.status(403).json({message: "Admin not allowed to vote ❌"});
        }

        //Update the Candidate document to record the vote
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        //Update the user isVoted status
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: "Vote recorded successfully 🥳"});
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error 😰"});
    }

});

//GET route for count votes
router.get('/vote/count', async (req, res) =>{
    try{
        //find all the candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({voteCount: 'desc'});

        //Map the candidate to return their party name and voteCount
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
});

//GET route to show the list of candidates
router.get('/candidates', async (req, res) => {
    try{
        const candidates = await Candidate.find();
        console.log("candidate list", candidates);
        if(!candidates)
            return res.status(404).json({message: "No Candidate listed yet"});

        const candidateList = candidates.map((data) => {
            return {
                name: data.name,
                party: data.party,
                age: data.age,
                voteCount: data.voteCount
            }
        })
        return res.status(200).json(candidateList);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
})

module.exports = router;
