
const Playlist = require('../../../models/Playlist');
const Album = require('../../../models/Album');


const  Library=async (req,res)=>{
    try {
        const userId = req.user.id;

        // Fetch playlists liked or created by the user
        const playlists = await Playlist.find({
            $or: [
                { user: userId},
                { likes: userId },
            ],
        }).select('name _id picURL');

        // Fetch albums liked by the user
        const albums = await Album.find({
            likes: userId,
        }).select('title _id picURL');

        res.status(200).json({
            playlists: playlists,
            albums: albums,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching library data' });
    }
}


module.exports={
    Library
}