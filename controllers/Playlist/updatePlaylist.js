const User = require('../../models/User');
const Playlist = require('../../models/Playlist');
const Track = require('../../models/Track');

const updatePlaylist = async (req, res) => {
  const userId = req.user.id;
  const name = req.params.name;
  const PlayList = req.body.playlist;

  // Check for missing input data
  if (!PlayList || !name) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: Playlist name and Song name',
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
    const track = await Track.findOne({ title: name });
    if (!track) {
      return res.status(400).json({
        success: false,
        message: 'Track not found',
      });
    }
    const playlist = await Playlist.findOne({ name: PlayList });
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