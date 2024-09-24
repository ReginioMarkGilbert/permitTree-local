const express = require('express');
// const mongoose = require('mongoose');
const connectDB = require('./config/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware

// CORS Configuration
const corsOptions = {
    origin: 'http://localhost:5173', // Allow requests from your frontend
    optionsSuccessStatus: 200,
    credentials: true // Allow credentials if you are using cookies/sessions
};

app.use(cors(corsOptions));
// Enable file upload
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    },
}));
// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Increase the size limit for file uploads (to fix PayloadTooLargeError)
app.use(bodyParser.json({ limit: '50mb' })); // Adjust size as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: true
    // saveUninitialized: true,
    // cookie: {
    //     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    // }
}));

// Passport middleware
app.use(passport.initialize());

// Routes
const chainsawRoutes = require('./User/routes/PermitApplicationsRoutes/chainsawApplicationRoutes');
app.use('/api', chainsawRoutes);

const authRoutes = require('./User/routes/userAuthRoutes');
app.use('/api', authRoutes);

const contactRoutes = require('./User/routes/contactRoutes');
app.use('/api', contactRoutes);

const adminRoutes = require('./Admin/routes/adminAuthRoutes');
app.use('/api/admin', adminRoutes);

const adminDashboardRoutes = require('./Admin/routes/adminDashboardRoutes');
app.use('/api/admin', adminDashboardRoutes);


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
