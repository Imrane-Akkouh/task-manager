const express = require('express');
const router = express.Router();
const Task = require('../models/task.model');
const auth = require('../middleware/auth.middleware');

//creating a brand new task - endpoint 
router.post('/tasks', auth, (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    task.save().then((task) => {
        res.status(201).send(task);
    }).catch(error => {
        res.status(400).send(error);
    })
})

//getting all tasks associated with current user - endpoint
router.get('/tasks', auth, async (req, res) => {
    await req.user.populate('tasks').execPopulate();
    res.send(req.user.tasks);
})

//getting a task by id - endpoint
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
        res.status(404).send({ error: "task not found" });
    }
    res.status(200).send(task);
})

//updating a task - endpoint
router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
    if (!isValidUpdate) {
        return res.status(400).send('Unrecognized fields to update');
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send('task not found');
        }
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.status(202).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})

//deleting a task - endpoint
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findByIdAndDelete({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send({error: "task not found"})
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;