const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');

//creating multer instance for file uploads
const upload = multer({
    storage: multer.memoryStorage(),//necessary for reading file buffer
    limits: {
        fileSize: 1500000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('please upload an image file'));
        }
        cb(undefined, true);

    }
})

//creating a brand new user - endpoint 
router.post('/users', (req, res) => {
    const user = new User(req.body);

    user.save().then(async (user) => {
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    }).catch(error => {
        res.status(400).send(error);
    })
})

//user login - endpoint
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send('Wrong credentials ' + error);
    }
})

//user logout - endpoint
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send('Ooops!! Something went wrong. ' + error);
    }
})

//user logout from all sessions/devices - endpoint
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send('Ooops!! Something went wrong. ' + error);
    }
})

//getting current user profile - endpoint
router.get('/users/me', auth, (req, res) => {
    res.send(req.user);
})

//getting avatar image of a user - endpoint
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error("user not found or doesn't have a profile picture")
        }
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send({ error })
    }
})

//creating & updating an avatar image for user - endpoint
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send()
}, (error, req, res, next) => {
    if (error)
        res.status(400).send({ error: error.message });
})

//deleting avatar image of user - endpoint
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send()
})


//getting a user by id (Admins only) - endpoint
// router.get('/users/:id', (req, res)=>{
//     const _id= req.params.id;
//     User.find({_id}).then(user => {
//         res.status(200).send(user);
//     }).catch(error=>{
//         if(error.kind=="ObjectId"){
//             return res.status(404).send('No user found with matching ID');
//         }
//         res.status(500).send(error);
//     })
// })

//updating user profile - endpoint
router.patch('/users/me', auth, async (req, res) => {
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const updateKeys = Object.keys(req.body);
    const isValidUpdate = updateKeys.every(update => allowedUpdates.includes(update));
    if (!isValidUpdate) {
        return res.status(400).send('Unrecognized fields to update');
    }
    try {
        updateKeys.forEach(update => {
            req.user[update] = req.body[update];
        })
        await req.user.save();
        res.status(202).send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
})

//deleting a user - endpoint
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.status(202).send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
}),

    module.exports = router;