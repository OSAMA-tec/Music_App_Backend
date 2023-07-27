const Track = require('../../models/Track');
const Artist = require('../../models/Artist');

const getTracks = async (req, res) => {
    try {
        const tracks = await Track.find().lean();
        const artistPromises = tracks.map((track) => Artist.findById(track.artist));

        // Wait for all artist promises to resolve.
        const artists = await Promise.all(artistPromises);

        // Create an array of track detail objects.
        const trackDetails = tracks.map((track, index) => {
            return {
                artistName: artists[index].name,
                songTitle: track.title,
                genre: track.genre,
                audio: track.audioFile,
                coverImage: track.coverImage,
                album: track.album,
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Successful',
            trackDetails: trackDetails,
        });
    } catch (error) {
        console.error(`Error occurred while retrieving the tracks: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving the tracks',
        });
    }
};

const searchTrack = async (req, res) => {
    try {
        const Tracks = await Track.find().lean();
        const searchName = req.params.name;

        if (!searchName) {
            console.error('Params not found');
            return res.status(400).json({
                success: false,
                message: 'Params not found',
            });
        }

        const tracks = Tracks.filter(value => value.title === searchName);
        const artistPromises = tracks.map((track) => Artist.findById(track.artist));

        // Wait for all artist promises to resolve.
        const artists = await Promise.all(artistPromises);

        // Create an array of track detail objects.
        const trackDetails = tracks.map((track, index) => {
            return {
                artistName: artists[index].name,
                songTitle: track.title,
                genre: track.genre,
                audio: track.audioFile,
                coverImage: track.coverImage,
                album: track.album,
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Successful',
            trackDetails: trackDetails,
        });
    } catch (error) {
        console.error(`Error occurred while retrieving the tracks: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving the tracks',
        });
    }
};

module.exports = { getTracks, searchTrack };