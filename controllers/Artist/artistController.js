const Artist = require('../../models/Artist');

const putData = async (req, res) => {
  const { name, bio, genre } = req.body;

  // Input Validation
  if (!name || !bio || !genre) {
    return res.status(400).json({
      success: false,
      message: 'Name, Bio and Genre are required fields',
    });
  }

  try {
    const Id = req.user.id;
    const user = await Artist.findOne({ userId: Id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.name = name;
    user.bio = bio;
    user.genre = genre;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Data updated successfully!',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating data',
    });
  }
}
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
        message: 'An error occurred while updating data',
      });
    }
  }
  
module.exports = { putData,getData };