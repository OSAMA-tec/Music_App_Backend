const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    artists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }],
});

module.exports = mongoose.model('Manager', ManagerSchema);