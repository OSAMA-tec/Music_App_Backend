const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 


//EXPORTING ALL
const {createAlbum} = require('../controllers/Album/createAlbum');

router.post('/artist/album', auth,createAlbum)

module.exports = router;