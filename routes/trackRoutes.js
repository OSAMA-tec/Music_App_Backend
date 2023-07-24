const express = require('express');
const {getTracks} = require('../controllers/Tracks/getTracks');
const auth = require('../middleware/auth'); 

const router = express.Router();

router.get('/tracks', auth,getTracks);
module.exports = router;





