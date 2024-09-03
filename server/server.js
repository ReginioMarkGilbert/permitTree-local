const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/PermiTree-db')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Routes
const chainsawRoutes = require('./routes/chainsaw_Routes');
app.use('/api', chainsawRoutes);
// const userProfileRoutes = require('./routes/userProfileRoutes');
// app.use('/api', userProfileRoutes);
const authRoutes = require('./routes/userAuthRoutes');
app.use('/api', authRoutes);
// const notificationRoutes = require('./routes/notificationRoutes');
// app.use('/api', notificationRoutes);

const adminRoutes = require('./routes/AdminRoutes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
