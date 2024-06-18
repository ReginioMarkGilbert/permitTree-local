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
mongoose.connect('mongodb://localhost:27017/chainsawRegistration', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Routes
// const applicationRoutes = require('./routes/chainsaw_Routes');
// const adminRoutes = require('./routes/AdminRoutes/admin_routes');
const userRoutes = require('./routes/userProfileRoutes');
app.use('/api', userRoutes);
const authRoutes = require('./routes/userAuthRoutes');
app.use('/api', authRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
