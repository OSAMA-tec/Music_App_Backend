const User = require('../../../models/User');
const { bucket, admin } = require('../../../config/firbaseConfig');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadProfilePicture = async (req, res) => {
  const userId = req.user.id;
  const image = req.file;

  if (!image) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided',
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

    const fileName = `profile_pictures/${userId}/${Date.now()}-${image.originalname}`;
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: image.mimetype,
      },
    });

    blobStream.on('error', (error) => {
      console.error('Error uploading file:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading file',
      });
    });

    blobStream.on('finish', async () => {
      const picURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
        fileName
      )}?alt=media`;

      user.local.picURL = picURL;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        picURL,
      });
    });

    blobStream.end(image.buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while uploading the profile picture',
    });
  }
};

module.exports = { uploadProfilePicture };