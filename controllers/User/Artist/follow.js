
const Artist=require('../../../models/Artist')

const follow= async (req, res) => {
  const { follow } = req.body;
  const userId = req.user.id;
  const artistId = req.body.artistId;

  if (follow === undefined) {
    return res.status(400).json({
      success: false,
      message: "Follow status is required",
    });
  }

  try {
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found",
      });
    }

    if (follow) {
      // Add the user's ID to the followers array if not already present
      if (!artist.followers.includes(userId)) {
        artist.followers.push(userId);
      }
    } else {
      // Remove the user's ID from the followers array if present
      artist.followers = artist.followers.filter((id) => id !== userId);
    }

    await artist.save();

    return res.status(200).json({
      success: true,
      message: follow ? "User followed the artist" : "User unfollowed the artist",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the follow status",
    });
  }
};

module.exports = {follow};