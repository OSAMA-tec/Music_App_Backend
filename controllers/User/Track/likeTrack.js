
const Track = require('../../../models/Track');

const likeTrack = async (req, res) => {
  const userId = req.user.id;
  const trackId = req.params.trackId;
  const { like } = req.body;

  if (like === undefined) {
    return res.status(400).json({
      success: false,
      message: "Like status is required",
    });
  }

  try {
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    if (like) {
      // Add the user's ID to the likes array if not already present
      if (!track.likes.includes(userId)) {
        track.likes.push(userId);
      }
    } else {
      // Remove the user's ID from the likes array if present
      track.likes = track.likes.filter((id) => id !== userId);
    }

    await track.save();

    return res.status(200).json({
      success: true,
      message: like ? "User liked the track" : "User unliked the track",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the like status",
    });
  }
};

  module.exports={likeTrack}