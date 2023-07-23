const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true,
    },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
    },
    duration: {
        type: Number,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Track', TrackSchema);