const express = require('express');
const router = express.Router();
const Task = require('../models/task.model');

router.post('/tasks', (req, res)=>{
    const task = new Task(req.body);
    
    task.save().then((task)=>{
        res.status(201).send(task);
    }).catch(error=>{
        res.status(400).send(error);
    })
})

router.get('/tasks', (req, res)=>{
    Task.find({}).then(tasks => {
        res.status(200).send(tasks);
    }).catch(error=>{
        res.status(500).send(error);
    })
})

router.get('/tasks/:id', (req, res)=>{
    const _id= req.params.id;
    Task.find({_id}).then(user => {
        res.status(200).send(user);
    }).catch(error=>{
        if(error.kind=="ObjectId"){
            return res.status(404).send('No user found with matching ID');
        }
        res.status(500).send(error);
    })
})

router.patch('/tasks/:id', async (req, res)=>{
    const _id= req.params.id;
    const allowedUpdates = ['description', 'completed'];

    const isValidUpdate = Object.keys(req.body).every(update=>allowedUpdates.includes(update));
    if(!isValidUpdate){
        return res.status(400).send('Unrecognized fields to update');
    }

    try{
        const task = await Task.findByIdAndUpdate({_id}, req.body, { new: true, runValidators: true});
        if(!task){
            return res.status(404).send('task not found with matching ID');
        }
        res.status(202).send(task);
    }catch(error){
        res.status(400).send(error);
    }
})

router.delete('/tasks/:id', async (req,res)=>{
    const _id= req.params.id;
    try{
        const task = await Task.findByIdAndDelete({_id});
        if(!task){
            return res.status(404).send("task not found with matching ID")
        }
        res.status(202).send(task);
    }catch(error){
        res.status(500).send(error);
    }
});

module.exports = router;