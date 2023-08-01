// route file (e.g., artist.js)
const express = require("express");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
const auth = require("../middleware/auth");
const {putData,getData,upload} = require('../controllers/Artist/artistController');
const {createMerch} = require('../controllers/Artist/createMerch');

app.post('merch/create',auth, upload.single('image'), createMerch);
router.put("/update",auth, upload.single("pic"), putData);
router.get('/data', auth,getData);



module.exports = router;