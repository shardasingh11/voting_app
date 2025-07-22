const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


//Define the User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        reequired: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next){
    const user = this;

    //Hash the password only if it is modified or new
    if(!user.isModified('password')) return next();

    try{
        //hash password generation
        const salt = await bcrypt.genSalt(10);
        //create hash password using salt
        const hashedPassword = await bcrypt.hash(this.password, salt);

        //override the plain password with plain password
        user.password = hashedPassword;
        next()

    }catch(err){
        return next(err);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        //use bcrypt to compare the provided password with hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}


//create Use model
const User = mongoose.model('User', userSchema);
module.exports = User; 