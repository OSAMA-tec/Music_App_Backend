const Track = require('../../models/Track');
const Artist = require('../../models/Artist');

const deleteTrack = async (req, res) => {
    const userId = req.user.id;
    const songName = req.body.name;

    if (!songName) {
        console.error('Name not passed');
        return res.status(404).json({
            success: false,
            message: 'Name not passed',
        });
    }

    try {
        const track = await Track.findOne({ title: songName });
        const artist = await Artist.findOne({ userId: userId });

        if (!track) {
            console.error(`Track not found: ${songName}`);
            return res.status(404).json({
                success: false,
                message: 'Track not found',
            });
        }

        if (!artist) {
            console.error(`Artist not found: ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'Artist not found',
            });
        }

        if (req.user.role === 'artist') {
            if (track.artist.toString() === artist._id.toString()) {
                await Track.deleteOne({ _id: track._id }).catch((error) => {
                    console.error(`Error deleting track: ${error}`);
                    return res.status(500).json({
                        success: false,
                        message: 'An error occurred while trying to delete the track',
                    });
                });

                return res.status(200).json({
                    success: true,
                    message: 'Track deleted successfully',
                });
            } else {
                console.error('This track is not yours');
                return res.status(400).json({
                    success: false,
                    message: 'This track is not yours',
                });
            }
        } else {
            console.error('You are not authorized to delete this track');
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this track',
            });
        }
    } catch (error) {
        console.error(`Error occurred while trying to delete the track: ${error}`);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while trying to delete the track',
        });
    }
};

module.exports = { deleteTrack }