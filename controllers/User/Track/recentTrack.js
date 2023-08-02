const User = require('../../../models/User');

const addTrack= async (req, res) => {
    const { trackId } = req.body;
    const userId=req.user.id;
    if ( !trackId) {
      return res.status(400).json({ error: ' track ID are required' });
    }
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (user.RecentTrack.length >= 10) {
        user.RecentTrack.shift();
      }
      user.RecentTrack.push(trackId);
  
      await user.save();
  
      res.status(200).json({ message: 'Track ID added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while adding the track ID' });
    }
  };
  
  const recentTrack= async (req, res) => {
    const userId  = req.user.id;
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ RecentTrack: user.RecentTrack });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while retrieving the recent tracks' });
    }
  };
  
 module.exports={addTrack,recentTrack}