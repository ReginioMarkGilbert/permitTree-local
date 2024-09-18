const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();

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
        fileSize: 5 * 1024 * 1024 // 5 MB max file size
    },
}));
// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Increase the size limit for file uploads (to fix PayloadTooLargeError)
app.use(bodyParser.json({ limit: '10mb' })); // Adjust size as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

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
const chainsawRoutes = require('./routes/PermitApplicationsRoutes/chainsawApplicationRoutes');
app.use('/api', chainsawRoutes);

const authRoutes = require('./routes/UserRoutes/userAuthRoutes');
app.use('/api', authRoutes);

const adminRoutes = require('./routes/AdminRoutes/adminRoutes');
app.use('/api/admin', adminRoutes);

const contactRoutes = require('./routes/UserRoutes/contactRoutes');
app.use('/api', contactRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
