
const Album = require('../../../models/Album');

const likeAlbum = async (req, res) => {
  const userId = req.user.id;
  const albumId = req.body.albumId;
  const { like } = req.body;

  if (like === undefined) {
    return res.status(400).json({
      success: false,
      message: "Like status is required",
    });
  }

  try {
    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "album not found",
      });
    }

    if (like) {
      // Add the user's ID to the likes array if not already present
      if (!album.likes.includes(userId)) {
        album.likes.push(userId);
      }
    } else {
      // Remove the user's ID from the likes array if present
      album.likes = album.likes.filter((id) => id !== userId);
    }

    await album.save();

    return res.status(200).json({
      success: true,
      message: like ? "User liked the album" : "User unliked the album",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the like status",
    });
  }
};

  module.exports={likeAlbum}