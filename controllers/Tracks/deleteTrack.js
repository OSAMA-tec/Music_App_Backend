
const Track = require('../../models/Track');
const Artist = require('../../models/Artist');



const deleteTrack = async (req, res) => {
    const userId = req.user.id;; 
    const songName=req.body.name; 
    if(!songName){
        return res.status(404).json({
            success: false,
            message: 'Name not Passed',
        });
    }
    try {
        const track = await Track.findOne({ title: songName });
        const artist=await Artist.findOne({userId:userId});

        if (!track) {
            return res.status(404).json({
                success: false,
                message: 'Track not found',
            });
        }
        if (req.user.role === 'artist') {
            if (track.artist.toString() === artist._id.toString()) {
                await Track.deleteOne({ _id: track._id });
    
                return res.status(200).json({
                    success: true,
                    message: 'Track deleted successfully',
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'This Track is Not Yours',
                });
            }
        } else {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this track',
            });
        }
    } catch (error) {
        console.error(error);
    
        return res.status(500).json({
            success: false,
            message: 'An error occurred while trying to delete the track',
        });
    }
}
    module.exports = { deleteTrack };