const Artist = require('../../models/Artist');
const Album = require('../../models/Album');

const deleteAlbum = async (req, res) => {
  const userId = req.user.id;
  const title = req.body.name;

  try {
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete an album',
      });
    }

    const artist = await Artist.findOne({ userId: userId });

    if (!artist) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const album = await Album.findOne({ title: title });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found',
      });
    }

    if (album.artist.toString() !== artist._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this album',
      });
    }

    await Album.deleteOne({ title: title });

    // Remove the album reference from the artist's albums array
    artist.albums = artist.albums.filter((item) => item.toString() !== album._id.toString());

    // Save the updated artist
    await artist.save();

    return res.status(200).json({
      success: true,
      message: 'Album deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the album',
    });
  }
};

module.exports = { deleteAlbum };