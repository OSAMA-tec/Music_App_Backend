const User = require('../../../models/User');
const Playlist = require('../../../models/Playlist');
const Track = require('../../../models/Track');

const updatePlaylist = async (req, res) => {
  const userId = req.user.id;
  const trackId = req.body.trackId;
  const PlayListID = req.body.playlistId;

  // Check for missing input data
  if (!playlistId || !trackId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: Playlist Id and Song ID',
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No User Found',
      });
    }
    const track = await Track.findById( trackId );
    if (!track) {
      return res.status(400).json({
        success: false,
        message: 'Track not found',
      });
    }
    const playlist = await Playlist.findById(PlayListID );
    if (!playlist) {
      return res.status(400).json({
        success: false,
        message: 'Playlist not found',
      });
    }
    playlist.tracks.push(track._id);
    await playlist.save();
    return res.status(200).json({
      success: true,
      message: 'Track Added Successfully',
    });
  } catch (error) {
    console.error(error);

    // Handle specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Invalid input data',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the playlist',
    });
  }
};

module.exports = { updatePlaylist };