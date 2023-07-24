const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    bio: {
        type: String,
    },
    userId:{
        type:String,
    },
    genre: {
        type: String,
    },
    albums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }],
});

module.exports = mongoose.model('Admin', AdminSchema);