const Artist = require('../../../models/Artist');
const Album = require('../../../models/Album');
const Track = require('../../../models/Track');

const getAlbum = async (req, res) => {
  try {
    if (!Artist || !Album) {
      throw new Error('Required modules not found');
    }

    const albums = await Album.find()
      .populate({
        path: 'artist',
        select: 'name',
      })
      .populate({
        path: 'tracks',
        select: 'title coverImage audioFile genre',
      })
      .catch((error) => {
        throw new Error(`Error while fetching albums: ${error.message}`);
      });

    if (!albums) {
      return res.status(400).json({
        success: true,
        message: 'No Albums Found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Getting All Albums',
      albums,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `An error occurred: ${error.message}`,
    });
  }
};



const specificAlbum=async (req,res)=>{
  const albumId=req.body.albumId;
  const userId=req.user.id;
  try {
    if (!Artist || !Album) {
      throw new Error('Required modules not found');
    }

    const album = await Album.findById(albumId) .populate({
      path: 'artist',
      select: 'name',
    })
    .populate({
      path: 'tracks',
      select: 'title coverImage audioFile genre',
    }).catch((error) => {
      throw new Error(`Error while fetching albums: ${error.message}`);
    });
    if (!album) {
      return res.status(400).json({
        success: true,
        message: 'No Albums Found',
      });
    }
    const userLiked = album.likes.includes(userId);

    return res.status(200).json({
      success: true,
      message: 'Getting  Album',
      data :{
        album:album,
        totalLikes:album.likes.length,
        like:userLiked,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `An error occurred: ${error.message}`,
    });
  }
}
module.exports = { getAlbum,specificAlbum };