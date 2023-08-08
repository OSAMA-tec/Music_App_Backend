const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
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
exports.loginUser = async (req, res) => {
  const { phoneNumber, email, verify } = req.body;
  if (!verify) {
    return res.status(400).json({
      success: false,
      message: 'Verify not passed',
    });
  }
  if (!phoneNumber && !email) {
    return res.status(400).json({
      success: false,
      message: 'Value not passed',
    });
  }

  try {
    let user;
    if (phoneNumber) {
      user = await User.findOne({ 'local.phoneNumber': phoneNumber });
    }
    else if (email) {
      user = await User.findOne({ 'local.email': email });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.local.verified || user.local.phoneNumber === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.local.otp = otp;
    user.local.otpCreatedAt = Date.now();
    await user.save();

    if (verify === 'email') {
      await sendOtpViaEmail(email, otp);
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
              ' Please verify your phone number.',
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
  const { phoneNumber, otp } = req.body;

  try {
    let user = await User.findOne({ 'local.phoneNumber': phoneNumber });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }
    const check = await bcrypt.compare(otp.toString(), user.local.otp);
    if (check) {
      user.local.otp = null; // Clear OTP
      user.local.otpCreatedAt = null; // Clear OTP timestamp
      await user.save();

      const payload = {
        id: user.id,
        phoneNumber: user.local.phoneNumber,
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