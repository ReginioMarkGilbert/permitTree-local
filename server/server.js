const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const db = 'mongodb://localhost:27017/chainsawRegistration';
// const db = 'mongodb+srv://markgilbert:6jSZ1vskFMjO6VH5@permittreeprototypedb.v3cxfds.mongodb.net/?retryWrites=true&w=majority&appName=PermittreePrototypeDB'

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Routes
const applicationRoutes = require('./routes/chainsaw_Routes');
const adminRoutes = require('./routes/AdminRoutes/admin_routes');

app.use('/api', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
