const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 


//EXPORTING ALL
const userController = require('../controllers/User/Registration/signup');
const userControllerLogin = require('../controllers/User/Registration/login');
const {getUser,updateUser,deleteUser}=require("../controllers/User/Profile/userController")
const {recoverPassword}=require("../controllers/User/Registration/recoverPassword")
const {topArtist,getSpecific} = require('../controllers/User/Artist/topArtist');
const {follow} = require('../controllers/User/Artist/follow');
const {getAlbum,specificAlbum} = require('../controllers/Album/getAlbum');
const {getTracks,searchTrack} = require('../controllers/User/Track/getTracks');




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





//Artist Related
router.get('/top-artists', auth,topArtist);
router.get('/top-artists/:artistId', auth,getSpecific);
router.put('/follow/:artistId', auth,follow);



//Album Related
router.get('/artist/album', auth,getAlbum)
router.get('/artist/album/:name', auth,specificAlbum)





//Track Related
router.get('/tracks', auth,getTracks);
router.get('/tracks/search/:trackId', auth,searchTrack);
module.exports = router;