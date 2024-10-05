const express = require('express');
const requestLogger = require('./middleware/requestLogger');
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
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true // Allow credentials if using cookies/sessions
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

// Use the request logger middleware
// app.use(requestLogger);

// Routes
const chainsawRoutes = require('./User/routes/PermitApplicationsRoutes/chainsawApplicationRoutes');
app.use('/api', chainsawRoutes);

const oopRoutes = require('./User/routes/userOOPRoutes');
app.use('/api/', oopRoutes);

const authRoutes = require('./User/routes/userAuthRoutes');
app.use('/api', authRoutes);

const userNotificationRoutes = require('./User/routes/userNotificationRoutes');
app.use('/api/user', userNotificationRoutes);

const contactRoutes = require('./User/routes/contactRoutes');
app.use('/api', contactRoutes);

const allPermitsRoutes = require('./User/routes/PermitApplicationsRoutes/allPermitsRoutes');
app.use('/api/permits', allPermitsRoutes);

const adminRoutes = require('./Admin/routes/admin_routes/adminAuthRoutes');
app.use('/api/admin', adminRoutes);

const adminDashboardRoutes = require('./Admin/routes/admin_routes/adminDashboardRoutes');
app.use('/api/admin', adminDashboardRoutes);

const adminReportsRoutes = require('./Admin/routes/admin_routes/adminReportsRoutes');
app.use('/api/admin/reports', adminReportsRoutes);

const chiefRPSNotificationRoutes = require('./Admin/routes/ChiefRPS_routes/ChiefRPSNotificationRoutes');
app.use('/api/admin', chiefRPSNotificationRoutes);

const chiefRPSOrderOfPaymentRoutes = require('./Admin/routes/ChiefRPS_routes/ChiefOrderOfPaymentRoutes');
app.use('/api/admin', chiefRPSOrderOfPaymentRoutes);

const SA_ManageUserRoutes = require('./Admin/routes/SuperAdmin_routes/SA_ManageUserRoutes');
app.use('/api/admin/super', SA_ManageUserRoutes);

// Add this line to use the new user OOP routes
const userOOPRoutes = require('./User/routes/userOOPRoutes');
app.use('/api/user', userOOPRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
