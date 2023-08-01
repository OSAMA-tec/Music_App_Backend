const Merchandise = require('../../models/Merchandise');
const Artist = require('../../models/Artist');
const { bucket, admin } = require('../../config/firbaseConfig');
const multer = require('multer');
const createMerch = async (req, res) => {
    const { name, description, price } = req.body;
    const image = req.file;
    let artistId = req.user.id;
    // Check for missing input data
    if (!name  || !price || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, artistId, price, and image',
      });
    }
  
    try {
      const artist = await Artist.findOne({userId:artistId});
      if (!artist) {
        return res.status(400).json({
          success: false,
          message: 'No Artist Found',
        });
      }
  
      const fileName = `merchandise/${Date.now()}-${image.originalname}`;
      const fileUpload = bucket.file(fileName);
  
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: image.mimetype,
        },
      });
  
      blobStream.on('error', (error) => {
        console.error('Error uploading file:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading file',
        });
      });
  
      blobStream.on('finish', async () => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          fileName
        )}?alt=media`;
  
        const merch = new Merchandise({
          name,
          artist: artistId,
          description,
          price,
          imageUrl,
        });
  
        await merch.save();
  
        return res.status(200).json({
          success: true,
          message: 'Merchandise Created Successfully',
          merch,
        });
      });
  
      blobStream.end(image.buffer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while creating the merchandise',
      });
    }
  };
  
  module.exports = { createMerch };createMerch