
const Artist = require('../../models/Artist');
const Album = require('../../models/Album');

const createAlbum = async (req, res) => {
    const title = req.body.title;
    const genre = req.body.title;
    const userId = req.user.id;
    try {
        if (req.user.role !== 'artist') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this track',
            });
        }
        const artist = await Artist.findOne({ userId: userId });
        const albumArtist = artist._id;
        let currentDate = new Date().toLocaleDateString("en-US");

        if (!artist) {
            return res.status(400).json({
                success: false,
                message: 'User not Found',
            });
        }
        const newAlbum = new Album({
            title,
            genre,
            artist: albumArtist,
            releaseDate: currentDate,
        })
        const savedAlbum = await newAlbum.save();
        artist.albums.push(savedAlbum._id);
        await artist.save();
        return res.status(200).json({
            success: true,
            message: 'Successfully creating the album',
            Album: savedAlbum,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the album',
        });
    }
}
module.exports = { createAlbum };