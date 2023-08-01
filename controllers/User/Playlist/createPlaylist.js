const User = require('../../../models/User');
const Playlist = require('../../../models/Playlist');
const { bucket, admin } = require('../../../config/firbaseConfig');

const createPlaylist = async (req, res) => {
  const userId = req.user.id;
  const name = req.body.name;
  const description = req.body.description;
  const image = req.file;

  // Check for missing input data
  if (!description || !name) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: Description and name',
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

    let picURL = '';

    if (image) {
      const fileName = `${Date.now()}-${image.originalname}`;
      const fileUpload = bucket.file(fileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: image.mimetype,
        },
      });

      blobStream.on('error', (error) => {
        console.error('Error uploading file:', error);
        throw new Error('Error uploading file');
      });

      blobStream.on('finish', async () => {
        picURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          fileName
        )}?alt=media`;

        const playlist = new Playlist({
          name: name,
          user: userId,
          description: description,
          picURL: picURL,
        });

        user.playlists.push(playlist._id.toString());
        await user.save();
        await playlist.save();

        return res.status(200).json({
          success: true,
          message: 'PlayList Created Successfully',
        });
      });

      blobStream.end(image.buffer);
    } else {
      const playlist = new Playlist({
        name: name,
        user: userId,
        description: description,
      });

      user.playlists.push(playlist._id.toString());
      await user.save();
      await playlist.save();

      return res.status(200).json({
        success: true,
        message: 'PlayList Created Successfully',
      });
    }
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
      message: 'An error occurred while creating the album',
    });
  }
};

module.exports = { createPlaylist };