const Artist=require('../../models/Artist')
// artistController.js
const { bucket } = require("../../config/firbaseConfig");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const putData = async (req, res) => {
  const { name, bio, genre } = req.body;

  // Input Validation
  if (!name || !bio || !genre) {
    return res.status(400).json({
      success: false,
      message: "Name, Bio, and Genre are required fields",
    });
  }

  try {
    const Id = req.user.id;
    const user = await Artist.findOne({ userId: Id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.file) {
      const fileName = `artist-${user._id}-${Date.now()}.jpg`;
      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.on("error", (error) => {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while uploading the picture",
          error: error.message,
        });
      });

      stream.on("finish", async () => {
        const picURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          fileName
        )}?alt=media`;

        user.name = name;
        user.bio = bio;
        user.genre = genre;
        user.picURL = picURL;

        await user.save();

        return res.status(200).json({
          success: true,
          message: "Data updated successfully!",
        });
      });

      stream.end(req.file.buffer);
    } else {
      user.name = name;
      user.bio = bio;
      user.genre = genre;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Data updated successfully!",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating data",
      error: error.message,
    });
  }
};

const getData = async (req, res) => {
  try {
    const Id = req.user.id;
    const user = await Artist.findOne({ userId: Id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data found successfully!',
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving data',
      error: error.message,
    });
  }
}

module.exports = { putData, getData,upload }