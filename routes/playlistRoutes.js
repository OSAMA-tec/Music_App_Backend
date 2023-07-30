const express = require('express');
const {createPlaylist} = require('../controllers/Playlist/createPlaylist');
const {updatePlaylist} = require('../controllers/Playlist/updatePlaylist');
const {deletePlaylist} = require('../controllers/Playlist/deletePlaylist');
const {getPlaylist,getAllPlaylist} = require('../controllers/Playlist/getPlaylist');

const auth = require('../middleware/auth'); 

const router = express.Router();

router.post('/users/playlist', auth,createPlaylist);
router.put('/users/playlist/:name', auth,updatePlaylist);
router.delete('/users/playlist/', auth,deletePlaylist);
router.get('/users/playlist', auth,getPlaylist);
router.get('/users/playlist/All', auth,getAllPlaylist);


module.exports = router;


