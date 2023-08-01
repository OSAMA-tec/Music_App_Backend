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
    likes: {
		type: [String],
		of: Number,
	},
    composer: {
		type: String,
	},
    coverImage: {
		type: String,
		required: true,
		default:""
    	},
    duration: {
        type: Number,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    audioFile:{
        type: String,
        required: true
     },
});

module.exports = mongoose.model('Track', TrackSchema);