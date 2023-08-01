const User = require('../../../models/User');
const Playlist = require('../../../models/Playlist');

const getPlaylist = async (req, res) => {
  const userId = req.user.id;
  const PlayListId = req.body.PlayListId;
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
    const playlist = await Playlist.findById(PlayListId).populate({
        path: 'user',
        select: 'local.email',
      })
      .populate({
        path: 'tracks',
        select: 'title coverImage audioFile genre',
      }).catch((error) => {
        throw new Error(`Error while fetching albums: ${error.message}`);
      });

    if (!playlist) {
      return res.status(400).json({
        success: true,
        message: 'No Playlist Found',
      });
    }
      
    return res.status(200).json({
      success: true,
      message: 'Playlist',
      playlist,
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




const getAllPlaylist = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No User Found',
      });
    }
    const playlist = await Playlist.find().populate({
        path: 'user',
        select: 'local.email',
      })
      .populate({
        path: 'tracks',
        select: 'title coverImage audioFile genre',
      }).catch((error) => {
        throw new Error(`Error while fetching albums: ${error.message}`);
      });

    if (!playlist) {
      return res.status(400).json({
        success: true,
        message: 'No Playlist Found',
      });
    }
      
    return res.status(200).json({
      success: true,
      message: 'Playlist',
      playlist,
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


module.exports = { getPlaylist,getAllPlaylist }