const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Anonymous',
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid email')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('Password field cannot contain "password"');
            }
        }
    },
    age: {
        type: Number,
        required: true,
        validate(value){
            if(value<0){
                throw new Error('age must be positive');
            }
        }
    }
});

userSchema.statics.findByCredentials= async (email, password) => {
    const user = await User.findOne({email});
    
    if(!user){
        throw new Error('No user found with provided credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error('No user found with provided credentials')
    }

    return user;
}

userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;