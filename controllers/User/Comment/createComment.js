const Comment = require('../../../models/Comment');
const User = require('../../../models/User');
const Track = require('../../../models/Track');
const addComment = async (req, res) => {
    const { trackId, text } = req.body;
    const userId = req.user.id;
  
    // Check for missing input data
    if (!trackId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: trackId and text',
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
  
      const track = await Track.findById(trackId);
      if (!track) {
        return res.status(400).json({
          success: false,
          message: 'No Track Found',
        });
      }
  
      const comment = new Comment({
        user: userId,
        track: trackId,
        text,
      });
  
      await comment.save();
  
      return res.status(200).json({
        success: true,
        message: 'Comment added successfully',
        comment,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while adding the comment',
      });
    }
  };
  
  module.exports = { addComment };