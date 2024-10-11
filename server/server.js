const express = require('express');
const requestLogger = require('./middleware/requestLogger');
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
// const chainsawRoutes = require('./User/routes/PermitApplicationsRoutes/chainsawApplicationRoutes');
// app.use('/api', chainsawRoutes);
const { router: chainsawApplicationRouter } = require('./User/modules/PermitApplicationsModules/chainsawApplicationModule');
app.use('/api', chainsawApplicationRouter);

const { router: userOOPRouter } = require('./User/modules/userOOPModule');
app.use('/api/user', userOOPRouter);

const { router: userAuthRouter } = require('./User/modules/userAuthModule');
app.use('/api', userAuthRouter);

const { router: userNotificationRouter } = require('./User/modules/userNotificationModule');
app.use('/api/user', userNotificationRouter);

const { router: contactRouter } = require('./User/modules/contactModule');
app.use('/api', contactRouter);

const allPermitsModule = require('./User/modules/PermitApplicationsModules/AllPermitsModule');
app.use('/api/permits', allPermitsModule);

const { router: adminAuthRouter } = require('./Admin/AdminModules/adminAuthModule');
app.use('/api/admin', adminAuthRouter);

const { router: adminDashboardRouter } = require('./Admin/AdminModules/adminDashboardModule');
app.use('/api/admin', adminDashboardRouter);

const { router: adminReportsRouter } = require('./Admin/AdminModules/adminReportsModule');
app.use('/api/admin/reports', adminReportsRouter);

const { router: personnelNotificationRouter } = require('./Admin/AdminModules/PersonnelNotificationControllers');
app.use('/api/admin', personnelNotificationRouter);

const { router: chiefOrderOfPaymentRouter } = require('./Admin/AdminModules/chiefOrderOfPaymentModule');
app.use('/api/admin', chiefOrderOfPaymentRouter);

const { router: superAdminManageUsersRouter } = require('./Admin/SuperAdminModules/SA_ManageUsersModules');
app.use('/api/admin/super', superAdminManageUsersRouter);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
