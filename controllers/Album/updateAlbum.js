const Artist = require('../../models/Artist');
const Album = require('../../models/Album');
const Track = require('../../models/Track');

const updateAlbum = async (req, res) => {
  const userId = req.user.id;
  const songName = req.body.songName;
  const albumName = req.body.albumName;

  try {
    if (req.user.role !== 'artist') {
      return res.status(400).json({
        success: false,
        message: 'You are not authorized',
      });
    }

    const artist = await Artist.findOne({ userId: userId });
    const track = await Track.findOne({ title: songName });
    const album = await Album.findOne({ title: albumName });
  

    if (!artist || !track || !album) {
      return res.status(404).json({
        success: false,
        message: 'Artist, track, or album not found',
      });
    }

    if (artist._id.toString() === track.artist.toString()) {
      track.album=album._id;
      await track.save();
      album.tracks.push(track._id);
      await album.save();
    } else {
      return res.status(400).json({
        success: false,
        message: 'The track does not belong to the artist',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Track added to album',
      album,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `An error occurred: ${error.message}`,
    });
  }
};

module.exports = { updateAlbum };