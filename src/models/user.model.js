const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.model');

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
    },
    avatar: {
        type: Buffer
    },
    tokens: [{ //holds multiple tokens in case user logs in with different devices
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

//relationship between users and their tasks using FK owner linked to PK _id
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//adding an instance method to user schema to generate a token and attatch it to it in the db
userSchema.methods.generateAuthToken = async function(){
    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens.push({token});
    await user.save();
    return token;
}

//getting only publicly available user data and hiding private ones (password and token), called upon JSON.stringify, therefore res.send
userSchema.methods.toJSON = function(){
    const user = this;

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar; //large binary data, use get request to get it

    return userObject;
}

//adding a reference method to user schema to find user by email and password
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

//function hashing the password, to be called before every save action on the schema
userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();//if ommited, the request never goes forward and hangs when timedout
})

//function deleting tasks on cascade, te be called before every delete action on the schema
userSchema.pre('remove', async function(next){
    const user = this;

    await Task.deleteMany({owner: user._id});
    next();//if ommited, the request never goes forward and hangs when timedout
})

const User = mongoose.model('User', userSchema);

module.exports = User;