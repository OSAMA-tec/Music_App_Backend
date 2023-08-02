const Comment = require('../../../models/Comment');
const Track = require('../../../models/Track');
const getComments = async (req, res) => {
    const { trackId } = req.query;
  
    // Check for missing input data
    if (!trackId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: trackId',
      });
    }
  
    try {
      const track = await Track.findById(trackId);
      if (!track) {
        return res.status(400).json({
          success: false,
          message: 'No Track Found',
        });
      }
  
      const comments = await Comment.find({ track: trackId })
        .populate('user', 'local.name')
        .select('text timestamp');
  
      return res.status(200).json({
        success: true,
        message: 'Comments fetched successfully',
        comments,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching the comments',
      });
    }
  };
  
  module.exports = { getComments };