const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    const user = await User.findOne({ 'local.email': email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.local.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

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