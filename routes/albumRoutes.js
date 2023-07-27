const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 


//EXPORTING ALL
const {createAlbum} = require('../controllers/Album/createAlbum');
const {getAlbum,specificAlbum} = require('../controllers/Album/getAlbum');
const {updateAlbum} = require('../controllers/Album/updateAlbum');
const {deleteAlbum} = require('../controllers/Album/deleteAlbum');

router.post('/artist/album', auth,createAlbum)
router.get('/artist/album', auth,getAlbum)
router.get('/artist/album/:name', auth,specificAlbum)
router.put('/artist/album', auth,updateAlbum)
router.delete('/artist/album', auth,deleteAlbum)

module.exports = router;