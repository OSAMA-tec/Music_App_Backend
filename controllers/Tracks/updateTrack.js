const Track = require('../../models/Track');
const Artist = require('../../models/Artist');

const updateTrack = async (req, res) => {
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

        if (req.body.like) {
            if (!track.likes.includes(userId)) {
                track.likes.push(userId);
            }
        } else {
            track.likes = track.likes.filter(id => {
                const isMatch = String(id) !== String(userId);
                return isMatch;
            });
        }

        if (req.user.role === 'artist') {
            if (track.artist.toString() === artist._id.toString()) {
                if (req.body.newName) {
                    track.title = req.body.newName;
                }
                if (req.body.newGenre) {
                    track.genre = req.body.newGenre;
                }
            } else {
                console.error('You are not authorized to update this track');
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to update this track',
                });
            }
        }

        // Save the track.
        const updatedTrack = await track.save();

        return res.status(200).json({
            success: true,
            message: 'Track updated successfully',
            track: updatedTrack,
        });
    } catch (error) {
        console.error(`Error occurred while updating the track: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating the track',
        });
    }
};

module.exports = { updateTrack };