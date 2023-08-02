const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//EXPORTING ALL
const userController = require('../controllers/User/Registration/signup');
const userControllerLogin = require('../controllers/User/Registration/login');
const {getUser,updateUser,deleteUser}=require("../controllers/User/Profile/userController")
const {uploadProfilePicture}=require("../controllers/User/Profile/updatePic")
const {recoverPassword}=require("../controllers/User/Registration/recoverPassword")
const {topArtist,getSpecific} = require('../controllers/User/Artist/topArtist');
const {follow} = require('../controllers/User/Artist/follow');
const {getAlbum,specificAlbum} = require('../controllers/User/Album/getAlbum');
const {likeAlbum} = require('../controllers/User/Album/likeAlbum');
const {getTracks,searchTrack,specificTrack} = require('../controllers/User/Track/getTracks');
const {likeTrack} = require('../controllers/User/Track/likeTrack');
const {Library} = require('../controllers/User/Library/library');

const {createPlaylist} = require('../controllers/User/Playlist/createPlaylist');
const {updatePlaylist} = require('../controllers/User/Playlist/updatePlaylist');
const {deletePlaylist} = require('../controllers/User/Playlist/deletePlaylist');
const {getPlaylist,getAllPlaylist} = require('../controllers/User/Playlist/getPlaylist');
const {getMerch} = require('../controllers/User/Order/getMerch');



//  THROUGH FACEBOOK LOGIN 
router.get('/auth/facebook', userController.facebookAuth);
router.get('/auth/facebook/callback', userController.facebookAuthCallback);
router.get('/auth/google', userController.googleAuth);
router.get('/auth/google/callback', userController.googleAuthCallback);


//  THROUGH EMAIL AND PASSWORD
router.post('/register', userController.registerUser);
router.post('/verify', userController.verifyUser);
router.post('/login',userControllerLogin.loginUser);
router.post('/login/verify',userControllerLogin.verifyUser);
router.post('/recover-password',recoverPassword);



//  DATA GETTING and Delete
router.get('/user', auth,getUser)
router.put('/user', auth,updateUser)
router.delete('/user', auth,deleteUser)
router.post('/uploadProfilePicture',auth, upload.single('image'), uploadProfilePicture);





//Artist Related
router.get('/top-artists', auth,topArtist);
router.get('/top-artists/specific', auth,getSpecific);
router.put('/follow', auth,follow);



//Album Related
router.get('/artist/album', auth,getAlbum)
router.get('/artist/specific/album', auth,specificAlbum)
router.put('/artist/album/like', auth,likeAlbum)





//Track Related
router.get('/tracks', auth,getTracks);
router.get('/tracks/search', auth,searchTrack);
router.get('/specific/tracks', auth,specificTrack);
router.put('/tracks/like', auth,likeTrack);


//Library Related
router.get('/library', auth,Library);



//PlayList Related
router.post('/createPlaylist',auth, upload.single('image'), createPlaylist);
router.put('/playlist', auth,updatePlaylist);
router.delete('/playlist/', auth,deletePlaylist);
router.get('/playlist', auth,getPlaylist);
router.get('/playlist/All', auth,getAllPlaylist);


//Merch Data
router.get('/merch', auth,getMerch);


module.exports = router;