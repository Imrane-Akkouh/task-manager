const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const auth = require('../middleware/auth.middleware');
const { request } = require('express');

//creating a brand new user - endpoint 
router.post('/users', (req, res)=>{
    const user = new User(req.body);
    
    user.save().then(async (user)=>{
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    }).catch(error=>{
        res.status(400).send(error);
    })
})

//user login - endpoint
router.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    }catch(error){
        res.status(400).send('Wrong credentials '+error);
    }
})

//user logout - endpoint
router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    }catch(error){
        res.status(500).send('Ooops!! Something went wrong. '+error);
    }
})

//user logout from all sessions/devices - endpoint
router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens =[]
        await req.user.save();
        res.send();
    }catch(error){
        res.status(500).send('Ooops!! Something went wrong. '+error);
    }
})

//getting all users - endpoint
router.get('/users/me', auth, (req, res)=>{
    res.send(req.user);
})

//getting a user by id - endpoint
router.get('/users/:id', (req, res)=>{
    const _id= req.params.id;
    User.find({_id}).then(user => {
        res.status(200).send(user);
    }).catch(error=>{
        if(error.kind=="ObjectId"){
            return res.status(404).send('No user found with matching ID');
        }
        res.status(500).send(error);
    })
})

//updating a user - endpoint
router.patch('/users/:id', async (req, res)=>{
    const _id= req.params.id;
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const updateKeys = Object.keys(req.body);
    const isValidUpdate = updateKeys.every(update=>allowedUpdates.includes(update));
    if(!isValidUpdate){
        return res.status(400).send('Unrecognized fields to update');
    }
    try{
        const user = await User.findById({_id});
        updateKeys.forEach(update=>{
            user[update] = req.body[update];
        })
        await user.save();
        if(!user){
            return res.status(404).send('User not found with matching ID');
        }
        res.status(202).send(user);
    }catch(error){
        res.status(400).send(error);
    }
})

//deleting a user - endpoint
router.delete('/users/:id', async (req,res)=>{
    const _id= req.params.id;
    try{
        const user = await User.findByIdAndDelete({_id});
        if(!user){
            return res.status(404).send("User not found with matching ID")
        }
        res.status(202).send(user);
    }catch(error){
        res.status(500).send(error);
    }
}),

module.exports = router;