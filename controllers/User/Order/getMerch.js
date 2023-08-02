const Merchandise = require('../../../models/Merchandise');
const getMerch = async (req, res) => {
    try {
      const merchList = await Merchandise.find().populate('artist', 'name');
  
      return res.status(200).json({
        success: true,
        message: 'Merchandise list fetched successfully',
        merchList,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching the merchandise list',
      });
    }
  };
  
  module.exports = { getMerch };