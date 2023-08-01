const Track = require('../../../models/Track');
const Artist = require('../../../models/Artist');

const trackInfo = async (req, res) => {
    try {
      const trackId = req.body.trackId;
      const userId = req.user.id;
  
      if (!trackId) {
        console.error("trackId not found");
        return res.status(400).json({
          success: false,
          message: "trackId not found",
        });
      }
  
      const track = await Track.findById(trackId).populate("artist", "name _id picURL").populate('album',"title picURL");
      if (!track) {
        return res.status(400).json({
          success: true,
          message: "Track Not Found",
        });
      }
  
      // Check if the user's ID exists in the likes array
      const userLiked = track.likes.includes(userId);
  
      // Create an object with track details
      const trackDetails = {
        songId: track._id,
        songTitle: track.title,
        audio: track.audioFile,
        composer:track.composer,
        coverImage: track.coverImage,
        artistName: track.artist.name,
        artistpic: track.artist.picURL,
        artistId: track.artist._id,
        albumName:track.album.title,
        albumpic:track.album.picURL,
        like: userLiked, // Add the userLiked status to the response
        totalLikes: track.likes.length, // Add the total number of likes to the response
      };
  
      return res.status(200).json({
        success: true,
        message: "Successful",
        trackDetails,
      });
    } catch (error) {
      console.error(`Error occurred while retrieving the tracks: ${error}`);
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving the tracks",
      });
    }
  };