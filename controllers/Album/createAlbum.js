// albumController.js
const multer = require("multer");
const { admin, bucket } = require("../../config/firbaseConfig"); // Import admin and bucket from firebaseConfig.js
const Artist = require("../../models/Artist");
const Album = require("../../models/Album");

// Configure multer to use memoryStorage
const upload = multer({ storage: multer.memoryStorage() });

const createAlbum = async (req, res) => {
  const title = req.body.title;
  const genre = req.body.genre;
  const userId = req.user.id;

  // Input validation
  if (!title || !genre) {
    return res.status(400).json({
      success: false,
      message: "Title and genre are required",
    });
  }

  try {
    if (req.user.role !== "artist") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create an album",
      });
    }

    const artist = await Artist.findOne({ userId: userId });

    if (!artist) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const existingAlbum = await Album.findOne({ title: title, artist: artist._id });

    if (existingAlbum) {
      return res.status(400).json({
        success: false,
        message: "An album with the same title already exists for this artist",
      });
    }

    const albumArtist = artist._id;
    let currentDate = new Date().toLocaleDateString("en-US");

    if (req.file) {
      const fileName = `album-${artist._id}-${Date.now()}.jpg`;
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

        const newAlbum = new Album({
          title,
          genre,
          artist: albumArtist,
          releaseDate: currentDate,
          picURL: picURL, // Save the picURL in the album
        });

        const savedAlbum = await newAlbum.save();

        if (!savedAlbum) {
          return res.status(500).json({
            success: false,
            message: "An error occurred while saving the album",
          });
        }

        artist.albums.push(savedAlbum._id);
        const updatedArtist = await artist.save();

        if (!updatedArtist) {
          return res.status(500).json({
            success: false,
            message: "An error occurred while updating the artist",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Successfully created the album",
          Album: savedAlbum,
        });
      });

      stream.end(req.file.buffer);
    } else {
      // Handle the case when no picture is provided
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
          message: "An error occurred while saving the album",
        });
      }

      artist.albums.push(savedAlbum._id);
      const updatedArtist = await artist.save();

      if (!updatedArtist) {
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the artist",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Successfully created the album",
        Album: savedAlbum,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the album",
    });
  }
};

module.exports = { createAlbum, upload }; // Export the upload middleware