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
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }
    if (req.query.description) {
        //not optimal but only solution for partial text match with mongoDB
        match.description = { $regex: ".*" + req.query.description + ".*" }
    }

    if (req.query.sortBy) {// example url for sorting would be {{url}}/sortBy=createdAt:desc
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = (parts[1] === 'desc' ? -1 : 1);
    }

    await req.user.populate({
        path: 'tasks',
        match,
        options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        }
    }).execPopulate();
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
            return res.status(404).send({ error: "task not found" })
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;