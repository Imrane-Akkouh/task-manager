const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //relationship with user targetting user._id by default
    }
}, {
    timestamps: true
})

//enable this if indexed text search is needed
//taskSchema.index({ description: 'text' });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;