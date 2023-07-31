const Album = require("../../../models/Album");
const Artist = require("../../../models/Artist");
const User = require("../../../models/User");



const topArtist=async (req,res)=>{
    const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const topArtists = await Artist.find()
      .sort({ followers: -1 })
      .select("name picURL") // Sort by the number of followers in descending order
      .limit(10); // Limit the results to the top 10 artists

    return res.status(200).json({
      success: true,
      message: "Top 10 artists",
      artists: topArtists,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while getting the top artists",
    });
  }
}
// Import the Album model

const getSpecific = async (req, res) => {
  const userId = req.user.id;
  const artistId = req.body.artistId;

  try {
    const user = await User.findById(userId);
    const artist = await Artist.findById(artistId);

    if (!user || !artist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the artist's albums
    const albums = await Album.find({ artist: artistId })
      .select("title releaseDate picURL genre");

    // Find similar artists based on the genre
    const similarArtists = await Artist.find({ genre: artist.genre, _id: { $ne: artistId } })
      .select("name picURL")
      .limit(10);

    return res.status(200).json({
      success: true,
      message: "Artist details",
      artist: {
        name: artist.name,
        picURL: artist.picURL,
        followers: artist.followers.length,
      },
      albums: albums, // Add the artist's albums to the response
      similarArtists: similarArtists,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while getting the artist details",
    });
  }
};
module.exports={topArtist,getSpecific}