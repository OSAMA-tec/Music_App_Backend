const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    picURL: {
        type: String,
    },
    likes: {
		type: [String],
		of: Number,
	},
    genre: {
        type: String,
        required: true
    },
    tracks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track'
    }],
});

module.exports = mongoose.model('Album', AlbumSchema);