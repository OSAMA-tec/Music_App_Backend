const express = require('express');
const {updateTrack} = require('../controllers/Tracks/updateTrack');
const {deleteTrack} = require('../controllers/Tracks/deleteTrack');
const auth = require('../middleware/auth'); 

const router = express.Router();

router.put('/tracks', auth,updateTrack);
router.delete('/tracks', auth,deleteTrack);

module.exports = router;





