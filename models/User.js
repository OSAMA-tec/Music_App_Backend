const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['local', 'facebook', 'google'],
        required: true
    },
    local: {
        email: {
            type: String,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
        },
        name: {
            type: String,
        },
        phoneNumber: {
            type: String,
            maxLength: [13, 'Phone number should not exceed more than 13 digits'],
        },
        tempEmail: {
            type: String,
            lowercase: true,
        },
        tempNumber: {
            type: String,
        },
        picURL:{
            type:String,
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
        name: {
            type: String
        },
        email: {
            type: String,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
        }
    },
    google: {
        id: {
            type: String
        },
        name: {
            type: String
        },
        email: {
            type: String,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
        }
    },

    role: {
        type: String,
        enum: ['listener', 'artist', 'admin', 'manager'],
        default: 'listener'
    },
    socialHandles: [String],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }]
});

module.exports = mongoose.model('User', UserSchema);