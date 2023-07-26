
const Track = require('../../models/Track');
const Artist = require('../../models/Artist');

const updateTrack = async (req, res) => {
    const userId = req.user.id;; // user id from the request
    const songName=req.body.name; // song name from the request
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

        if (req.body.like) {
            if (!track.likes.includes(userId)) {
                track.likes.push(userId);
            }
        } else {
            track.likes = track.likes.filter(id => {
                const isMatch = String(id) !== String(userId);
                return isMatch;
            });
        }

        if(req.user.role==='artist'){
            if (track.artist.toString() === artist._id.toString()) {
                if(req.body.newName){
                    track.title=req.body.newName; 
                }
                if(req.body.newGenre){
                    track.genre=req.body.newGenre; 
                }
            }else {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to delete this track',
                });
            }

        }
        // Save the track.
        const updatedTrack = await track.save();
    
        return res.status(200).json({
            success: true,
            message: 'Likes updated successfully',
            track: updatedTrack
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating the likes',
        });
    }
}
    module.exports = { updateTrack };