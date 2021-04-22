const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decodedPayload._id, 'tokens.token': token });
        if(!user){
            throw new Error()
        }
        req.user = user;
        req.token = token;
        next();
    }catch(error){
        res.status(401).send('Authentication required')
    }
}

module.exports = auth;