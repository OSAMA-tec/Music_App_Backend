const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ 'local.email': email });
    if (!user || !user.local.verified||user.local.email=='') {
      if (user && !user.local.verified) {
        await User.deleteOne({ _id: user.id });
      }
      // Send a generic error message
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.local.password);
    if (!isMatch) {
      // Send a generic error message
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const payload = {
      id: user.id,
      email: user.local.email,
      role: user.role,
    };

    const secretKey = user.role === 'listener' ? process.env.JWT_SECRET_User : 
                      user.role === 'artist' ? process.env.JWT_SECRET_Artist : 
                      user.role === 'manager' ? process.env.JWT_SECRET_Manager : 
                      process.env.JWT_SECRET_Admin;

    // Generate a signed JWT token
    const token = jwt.sign(payload, secretKey, { expiresIn: '5 days' });

    return res.json({ 
      success: true,
      message: 'Logged in successfully', 
      token 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred',
    });
  }
};
exports.facebookLogin = passport.authenticate('facebook', { session: false });

exports.facebookLoginCallback = (req, res) => {
  passport.authenticate('facebook', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user: user
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      const payload = {
        id: user.id,
        email: user.facebook.email,
        role: user.role,
      };

      // Generate a signed JWT token
      if(user.role=="listener"){
        const token = jwt.sign(payload, process.env.JWT_SECRET_User, { expiresIn: '5 days' });
        return  res.json({ message: 'LogIn successfully', token });
    }
    else if (user.role=='artist'){
        const token = jwt.sign(payload, process.env.JWT_SECRET_Artist, { expiresIn: '5 days' });
        return  res.json({ message: 'LogIn successfully', token });
    }
    else if(user.role=='admin'){
        const token = jwt.sign(payload, process.env.JWT_SECRET_Admin, { expiresIn: '5 days' });
        return  res.json({ message: 'LogIn successfully', token });
    }
    });
  })(req, res);
};