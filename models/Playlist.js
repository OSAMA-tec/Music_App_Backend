const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
    },
    picURL: {
        type: String,
    },
    likes: {
		type: [String],
		of: Number,
	},
    tracks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track'
    }],
});

module.exports = mongoose.model('Playlist', PlaylistSchema);