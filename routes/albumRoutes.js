const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 


//EXPORTING ALL
const {createAlbum,upload} = require('../controllers/Album/createAlbum');
const {updateAlbum} = require('../controllers/Album/updateAlbum');
const {deleteAlbum} = require('../controllers/Album/deleteAlbum');

router.post('/artist/album', auth, upload.single("pic"),createAlbum)

router.put('/artist/album', auth,updateAlbum)
router.delete('/artist/album', auth,deleteAlbum)

module.exports = router;