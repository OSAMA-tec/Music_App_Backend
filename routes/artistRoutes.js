// route file (e.g., artist.js)
const express = require("express");

const router = express.Router();
const auth = require("../middleware/auth");
const {putData,getData,upload} = require('../controllers/Artist/artistController');

router.put("/update",auth, upload.single("pic"), putData);
router.get('/data', auth,getData);



module.exports = router;