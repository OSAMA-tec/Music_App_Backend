const express = require('express');
const {getTracks,searchTrack} = require('../controllers/Tracks/getTracks');
const {updateTrack} = require('../controllers/Tracks/updateTrack');
const {deleteTrack} = require('../controllers/Tracks/deleteTrack');
const auth = require('../middleware/auth'); 

const router = express.Router();

router.get('/tracks', auth,getTracks);
router.get('/tracks/search/:name', auth,searchTrack);
router.put('/tracks', auth,updateTrack);
router.delete('/tracks', auth,deleteTrack);

module.exports = router;





