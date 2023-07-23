const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
var SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;


// Set up Facebook strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name']
},
async function(accessToken, refreshToken, profile, cb) {
  let user = await User.findOne({ 'facebook.id': profile.id });

  if (!user) {
    user = new User({ 
      method: 'facebook', 
      role: 'listener', // default role for users signing up through Facebook
      facebook: { id: profile.id, email: profile.emails[0].value } 
    });
    await user.save();
  }

  return cb(null, user);
}
));
// Function for facebook authentication
exports.facebookAuth = passport.authenticate('facebook', { scope: ['email'] });

// Callback function for facebook authentication
exports.facebookAuthCallback = function(req, res) {
  const payload = { user: { id: req.user.id } };
  jwt.sign(payload, process.env.JWT_SECRET_User, { expiresIn: '5 days' }, (err, token) => {
    if (err) throw err;
    res.json({ token });
  });
};
// Function for local user registration
exports.registerUser = async (req, res) => {
  const { password, role } = req.body;
  const tempEmail = req.body.email;
  let email = '';

  try {
    let user = await User.findOne({ 'local.email': email });
    const verified = false;
    const otpCreatedAt = Date();

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
      // if (!user.local.verified) {
      //     // Delete unverified user
      //     await User.deleteOne({ _id: user.id });
      //     return res.status(400).json({
      //         message: 'User not found',
      // });
    // }
      

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpHash = await bcrypt.hash(otp.toString(), salt);

    user = new User({
      method: 'local',
      role,
      local: {
        verified,
        email,
        password: hashedPassword,
        otp: otpHash,
        otpCreatedAt,
        tempEmail,
      },
    });

    await user.save();

    // Send OTP by email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ "email": tempEmail }];
    sendSmtpEmail.sender = { "email": process.env.EMAIL_USERNAME, "name": "MUSIC APP" };
    sendSmtpEmail.subject = 'Verify your email';
    sendSmtpEmail.htmlContent = `
    <div style="
        background-color: #f8f9fa; 
        padding: 20px; 
        font-family: Arial, sans-serif; 
        text-align: center;">
        <div style="
            background-color: #ffffff; 
            margin: auto; 
            max-width: 600px; 
            padding: 40px; 
            border-radius: 4px; 
            box-shadow: 0px 0px 10px rgba(0,0,0,0.05);">
            <img src="https://yourwebsite.com/images/logo.png" alt="Your Company Logo" style="max-width: 200px; margin-bottom: 40px;">
            <h2 style="color: #333333; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #777777; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                Thank you for registering! Please enter the following One Time Password (OTP) to verify your email address:
            </p>
            <div style="
                background-color: #007bff; 
                color: #ffffff; 
                font-size: 24px; 
                padding: 20px; 
                border-radius: 4px;">
                ${otp}
            </div>
            <p style="color: #777777; font-size: 16px; line-height: 1.5; margin-top: 30px;">
                If you did not request this code, you can safely ignore this email.
            </p>
        </div>
        <p style="color: #777777; font-size: 14px; line-height: 1.5; margin-top: 20px;">
            © 2023 Your Company Name. All rights reserved.
        </p>
    </div>
`;
    new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(sendSmtpEmail)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error);
      })

    res.json({ message: 'Registered successfully. Please verify your email.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// Function for local user verification
exports.verifyUser = async (req, res) => {
  const { email, otp } = req.body;

  try {
    let user = await User.findOne({ 'local.tempEmail': email });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    // Check if OTP has expired
    const otpLifetime = 60; // OTP lifetime in seconds
    const otpAgeInSeconds = Math.floor((Date.now() - new Date(user.local.otpCreatedAt)) / 1000);
    if (otpAgeInSeconds > otpLifetime) {
      user.local.tempEmail = null; // Clear the tempEmail field
      user.local.otp = null; // Clear OTP
      user.local.otpCreatedAt = null; // Clear OTP timestamp
      await user.save();
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    const check = await bcrypt.compare(otp.toString(), user.local.otp);
    if (check) {
      user.local.email = user.local.tempEmail; // Update main email
      user.local.tempEmail = null; // Clear the tempEmail field
      user.local.verified = true;
      user.local.otp = null; // Clear OTP
      user.local.otpCreatedAt = null; // Clear OTP timestamp
      await user.save();


      console.log('User saved successfully: ', user);

      const payload = {
        user: {
          id: user.id,
        },
      };

      console.log('Payload for JWT:', payload);

      let jwt_secret = '';
      if (user.role == 'listener') {
        jwt_secret = process.env.JWT_SECRET_User;
      } else if (user.role == 'artist') {
        jwt_secret = process.env.JWT_SECRET_Artist;
      } else if (user.role == 'admin') {
        jwt_secret = process.env.JWT_SECRET_Admin;
      }

      console.log('JWT_SECRET:', jwt_secret);

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