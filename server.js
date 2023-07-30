const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const connectDB=require('./config/db')
require('dotenv').config();
const app = express();

const userRoutes = require('./routes/userRoutes');
const artistRoutes = require('./routes/artistRoutes');
const trackRoutes = require('./controllers/Tracks/createTrack');
const getTracks = require('./routes/trackRoutes');
const albumRoutes = require('./routes/albumRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

// Connect to MongoDB
connectDB();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// User routes
app.use('/api/users', userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api', trackRoutes);
app.use('/api', getTracks);
app.use('/api', albumRoutes);
app.use('/api', playlistRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));