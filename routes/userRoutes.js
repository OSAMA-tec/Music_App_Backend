const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 


//EXPORTING ALL
const userController = require('../controllers/User/signup');
const userControllerLogin = require('../controllers/User/login');
const {getUser,updateUser,deleteUser}=require("../controllers/User/userController")
const {recoverPassword}=require("../controllers/User/recoverPassword")



//  THROUGH FACEBOOK LOGIN AND SIGNUP
router.get('/auth/facebook', userController.facebookAuth);
router.get('/auth/facebook/callback', userController.facebookAuthCallback);
router.get('facebook/login',userControllerLogin.facebookLogin);
router.get('facebook/login/callback',userControllerLogin.facebookLoginCallback);


//  THROUGH EMAIL AND PASSWORD
router.post('/register', userController.registerUser);
router.post('/verify', userController.verifyUser);
router.post('/login',userControllerLogin.loginUser);
router.post('/recover-password',recoverPassword);


//  DATA GETTING and Delete
router.get('/user', auth,getUser)
router.put('/user', auth,updateUser)
router.delete('/user', auth,deleteUser)

module.exports = router;