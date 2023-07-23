const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['local', 'facebook'],
        required: true
    },
    local: {
        email: {
            type: String,
            match: [/.+\@.+\..+/, 'Please enter a valid email address']
        },
        tempEmail: {
            type: String,
            match: [/.+\@.+\..+/, 'Please enter a valid email address']
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters long']
        },
        otp: {
            type: String,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        otpCreatedAt: {
            type: Date,
        }
    },
    facebook: {
        id: {
            type: String
        },
        email: {
            type: String,
            match: [/.+\@.+\..+/, 'Please enter a valid email address']
        }
    },
    role: {
        type: String,
        enum: ['listener', 'artist', 'admin'],
        default: 'listener'
    },
    socialHandles: [String],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }]
});

module.exports = mongoose.model('User', UserSchema);