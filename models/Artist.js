const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    userId:{
        type: String,
    },
    bio: {
        type: String,
    },
    genre: {
        type: String,
    },
    picURL: {
        type: String,
    },
    albums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }],
    followers: [{
        type: String,
    }],
});

module.exports = mongoose.model('Artist', ArtistSchema);