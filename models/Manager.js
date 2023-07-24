const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    userId:{
        type:String,
    },
    bio: {
        type: String,
    },
    genre: {
        type: String,
    },
    albums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }],
});

module.exports = mongoose.model('Manager', ManagerSchema);