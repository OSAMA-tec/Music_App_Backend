const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 


//EXPORTING ALL
const {putData,getData} = require('../controllers/Artist/artistController');




//  UPLOADING DATA and GETTING DATA
router.put('/data', auth,putData);
router.get('/data', auth,getData);


module.exports = router;