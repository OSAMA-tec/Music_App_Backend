const User = require('../../models/User');
const Playlist = require('../../models/Playlist');

const deletePlaylist = async (req, res) => {
  const userId = req.user.id;
  const PlayList = req.body.playlist;

  // Check for missing input data
  if (!PlayList) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: Playlist name ',
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
    const playlist=await Playlist.deleteOne({name:PlayList});
    playlist.save();
    return res.status(200).json({
        success: true,
        message: 'Deleted Successfull',
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

module.exports = { deletePlaylist };