const User = require('../../../models/User');
const Admin = require('../../../models/Admin');
const Artist = require('../../../models/Artist');
const Manager = require('../../../models/Manager');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SibApiV3Sdk = require('sib-api-v3-sdk');
const twilio = require('twilio');
require('dotenv').config();

SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/api/users/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name'],
  passReqToCallback: true
},
  async function (req, accessToken, refreshToken, profile, cb) {
    console.log('Facebook profile:', profile);
    let user = await User.findOne({ 'facebook.id': profile.id });

    if (!user) {
      user = new User({
        method: 'facebook',
        role: 'listener', // default role for users signing up through Facebook
        facebook: {
          id: profile.id,
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          email: profile.emails[0].value
        }
      });
      await user.save();
    }

    return cb(null, user);
  }
));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/users/auth/google/callback",
  passReqToCallback: true
},
  async function (req, accessToken, refreshToken, profile, cb) {
    console.log('Google profile:', profile);
    let user = await User.findOne({ 'google.id': profile.id });

    if (!user) {
      user = new User({
        method: 'google',
        role: 'listener', // default role for users signing up through Google
        google: {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        }
      });
      await user.save();
    }

    return cb(null, user);
  }
));



exports.facebookAuth = passport.authenticate('facebook', { scope: ['email'] });
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.facebookAuthCallback = function (req, res, next) {
  passport.authenticate('facebook', { scope: ['email'] }, function (err, user) {
    if (err) return next(err);
    const payload = {
      id: user.id,
      email: user.facebook.email,
      role: user.role,
    };
    jwt.sign(payload, process.env.JWT_SECRET_User, { expiresIn: '5 days' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user });
    });
  })(req, res, next);
};

exports.googleAuthCallback = function (req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email'] }, function (err, user) {
    if (err) return next(err);
    const payload = {
      id: user.id,
      email: user.google.email,
      role: user.role,
    };
    jwt.sign(payload, process.env.JWT_SECRET_User, { expiresIn: '5 days' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user });
    });
  })(req, res, next);
};


// Function to send OTP via Email using Sendinblue
async function sendOtpViaEmail(email, otp) {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.subject = 'GHM MUSIC APP OTP';
  sendSmtpEmail.htmlContent = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        box-sizing: border-box;
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #e5e5e5;
      }
      .header h1 {
        font-size: 24px;
        color: #333333;
        margin: 0;
      }
      .content {
        padding: 20px 0;
        text-align: center;
      }
      .content p {
        font-size: 16px;
        color: #666666;
        line-height: 1.5;
        margin: 0;
      }
      .otp {
        font-size: 24px;
        font-weight: bold;
        color: #00466a;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #e5e5e5;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>MUSIC APP</h1>
      </div>
      <div class="content">
        <p>Thank you for using MUSIC APP. Please use the following One-Time Password (OTP) to complete your registration process. This OTP is valid for 5 minutes.</p>
        <div class="otp">${otp}</div>
        <p>If you did not request this OTP, please ignore this email.</p>
      </div>
      <div class="footer">
        &copy; MUSIC APP. All rights reserved.
      </div>
    </div>
  </body>
  </html>`;
  sendSmtpEmail.sender = { email: process.env.EMAIL_FROM };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('OTP sent via Email');
  } catch (error) {
    console.error('Failed to send OTP via Email:', error);
    throw error;
  }
}

exports.registerUser = async (req, res) => {
  const { password, role, phoneNumber, name,verify } = req.body;
  const tempEmail = req.body.email;
  let email = '';
  if(!phoneNumber || !name || !tempEmail){
    return res.status(400).json({ msg: 'Phone Number or Name or Email required' });
  }
  try {
    let userE = await User.findOne({ 'local.tempEmail': tempEmail });
    let userEmail = await User.deleteMany({ 'local.tempEmail': tempEmail });

    let userP = await User.findOne({ 'local.tempPhone': tempEmail });
    let userPh = await User.deleteMany({ 'local.tempPhone': tempEmail });
    if (userE) {
      await Artist.deleteMany({ userId: userE._id });
    }
    if (userP) {
      await Artist.deleteMany({ userId: userP._id });
    }
    let user = await User.findOne({ 'local.email': tempEmail });
    const verified = false;

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    let userPhone = await User.findOne({ 'local.phoneNumber': phoneNumber });
    if (userPhone) {
      return res.status(400).json({ msg: 'Phone number already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000);

    user = new User({
      method: 'local',
      role,
      local: {
        verified,
        email,
        password: hashedPassword,
        otp: otp,
        tempEmail,
        tempNumber: phoneNumber,
        name: name,
      },
    });

    await user.save();

    let roleSpecificDoc;
    switch (role) {
      case 'admin':
        roleSpecificDoc = new Admin({ userId: user._id });
        break;
      case 'artist':
        roleSpecificDoc = new Artist({ userId: user._id });
        break;
      case 'manager':
        roleSpecificDoc = new Manager({ userId: user._id });
        break;
      default:
        break;
    }

    if (roleSpecificDoc) {
      await roleSpecificDoc.save();
    }
    
 if (verify === 'email') {
      await sendOtpViaEmail(tempEmail, otp);
      res.json({
        message: 'Registered successfully. Please verify your email.',
      });
    } else if (verify === 'phone') {
      twilioClient.messages
        .create({
          body: `Your OTP for MUSIC APP is: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        })
        .then(() => {
          console.log('OTP sent via SMS');
          res.json({
            message:
              'Registered successfully. Please verify your phone number.',
          });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({
            msg: 'Failed to send OTP via SMS. Please try again later.',
          });
        });
    } else {
      res.status(400).json({ msg: 'Invalid verify value' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.verifyUser = async (req, res) => {
  const { phoneNumber, email, otp } = req.body;

  try {
    let user;
    if (phoneNumber) {
      user = await User.findOne({ 'local.tempNumber': phoneNumber });
      if (!user) {
        user = await User.findOne({ 'local.phoneNumber': phoneNumber });
      }
    } else if (email) {
      user = await User.findOne({ 'local.tempEmail': email });
      if (!user) {
        user = await User.findOne({ 'local.email': email });
      }
    }

    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }
    if (otp===user.local.otp) {
      user.local.email = user.local.tempEmail; // Update main email
      user.local.tempEmail = null; // Clear the tempEmail field
      user.local.phoneNumber = user.local.tempNumber;
      user.local.tempNumber = null; // Clear the tempEmail field

      user.local.verified = true;
      user.local.otp = null; // Clear OTP
      user.local.otpCreatedAt = null; // Clear OTP timestamp
      await user.save();


      const payload = {
        id: user.id,
        email: user.local.email,
        role: user.role,
      };


      let jwt_secret = '';
      if (user.role == 'listener') {
        jwt_secret = process.env.JWT_SECRET_User;
      } else if (user.role == 'artist') {
        jwt_secret = process.env.JWT_SECRET_Artist;
      } else if (user.role == 'admin') {
        jwt_secret = process.env.JWT_SECRET_Admin;
      } else if (user.role == 'manager') {
        jwt_secret = process.env.JWT_SECRET_Manager;
      }


      jwt.sign(
        payload,
        jwt_secret,
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) {
            console.log('Error during JWT signing:', err);
            throw err;
          }
          console.log('Generated token:', token);
          res.json({ message: 'Verified successfully', token });
        }
      );
    } else {
      console.log(`Invalid OTP: received ${otp}, expected ${user.local.otp}`);
      res.status(400).json({ msg: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('Error caught:', err.message);
    res.status(500).send('Server Error');
  }
};

