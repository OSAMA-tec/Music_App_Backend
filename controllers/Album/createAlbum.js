const Artist = require('../../models/Artist');
const Album = require('../../models/Album');

const createAlbum = async (req, res) => {
  const title = req.body.title;
  const genre = req.body.genre;
  const userId = req.user.id;

  // Input validation
  if (!title || !genre) {
    return res.status(400).json({
      success: false,
      message: 'Title and genre are required',
    });
  }

  try {
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create an album',
      });
    }

    const artist = await Artist.findOne({ userId: userId });

    if (!artist) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const existingAlbum = await Album.findOne({ title: title, artist: artist._id });

    if (existingAlbum) {
      return res.status(400).json({
        success: false,
        message: 'An album with the same title already exists for this artist',
      });
    }

    const albumArtist = artist._id;
    let currentDate = new Date().toLocaleDateString("en-US");

    const newAlbum = new Album({
      title,
      genre,
      artist: albumArtist,
      releaseDate: currentDate,
    });

    const savedAlbum = await newAlbum.save();

    if (!savedAlbum) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while saving the album',
      });
    }

    artist.albums.push(savedAlbum._id);
    const updatedArtist = await artist.save();

    if (!updatedArtist) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while updating the artist',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully created the album',
      Album: savedAlbum,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the album',
    });
  }
}

module.exports = { createAlbum };