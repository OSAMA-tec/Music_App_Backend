const User = require('../../../models/User');
const Playlist = require('../../../models/Playlist');

const deletePlaylist = async (req, res) => {
  const userId = req.user.id;
  const playlistId = req.body.playlistId;

  // Check for missing input data
  if (!playlistId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: playlistId',
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

    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, user: userId });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or not owned by the user',
      });
    }

    await User.updateOne(
      { _id: userId },
      { $pull: { playlists: playlistId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully',
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
      message: 'An error occurred while deleting the playlist',
    });
  }
};

module.exports = { deletePlaylist };