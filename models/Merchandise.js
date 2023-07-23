const mongoose = require('mongoose');

const MerchandiseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
    },
});

module.exports = mongoose.model('Merchandise', MerchandiseSchema);