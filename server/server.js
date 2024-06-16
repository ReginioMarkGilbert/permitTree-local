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

// Use the session secret from the environment variable
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET is not defined in the environment variables');
}
// Session middleware
app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: true }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const db = 'mongodb://localhost:27017/chainsawRegistration';
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Routes
// const applicationRoutes = require('./routes/chainsaw_Routes');
// const adminRoutes = require('./routes/AdminRoutes/admin_routes');
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
