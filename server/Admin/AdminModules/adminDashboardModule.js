const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const express = require('express');
const router = express.Router();
const { UserNotification } = require('../../User/modules/userNotificationModule');
const { Admin } = require('./adminAuthModule');
const { Application } = require('../../User/modules/PermitApplicationsModules/chainsawApplicationModule');
const { User } = require('../../User/modules/userAuthModule');
const jwt = require('jsonwebtoken');

// Helper function to format date
const formatDate = (dateString) => {
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'Asia/Manila'
    };
    return new Date(dateString).toLocaleString('en-US', options);
};

router.get('/all-applications', async (req, res) => {
    try {
        const { sort, status, applicationType, search, excludeDrafts } = req.query;
        let filter = {};

        if (excludeDrafts === 'true') {
            filter.status = { $ne: 'Draft' };
        }

        if (status) {
            if (Array.isArray(status)) {
                filter.status = { $in: status.map(s => new RegExp(`^${s}$`, 'i')) };
            } else {
                filter.status = { $regex: new RegExp(`^${status}$`, 'i') };
            }
        }

        if (applicationType) {
            filter.applicationType = applicationType;
        }

        if (search) {
            filter.$or = [
                { customId: { $regex: search, $options: 'i' } },
                { ownerName: { $regex: search, $options: 'i' } },
                { applicationType: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = {};

        if (sort === 'date-asc') {
            sortOption.dateOfSubmission = 1;
        } else if (sort === 'date-desc') {
            sortOption.dateOfSubmission = -1;
        }

        const applications = await Application.find(filter).sort(sortOption);
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

router.get('/getApplicationById/:id', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching application by ID:', error);
        res.status(500).json({ message: 'Error fetching application by ID' });
    }
});

router.get('/file/:applicationId/:fileType/:fileIndex', async (req, res) => {
    try {
        const { applicationId, fileType, fileIndex } = req.params;
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (!application.files || !application.files[fileType] || !application.files[fileType][fileIndex]) {
            return res.status(404).json({ message: 'File not found in application' });
        }

        const file = application.files[fileType][fileIndex];

        // Check if the file data is stored in the database
        if (file.data) {
            res.contentType(file.contentType);
            return res.send(file.data);  // Make sure it's sending the actual data, not a buffer
        }

        // If not in the database, try to find it in the filesystem
        const filePath = path.join(__dirname, '../../../uploads', file.filename);

        try {
            await fs.access(filePath);
        } catch (error) {
            console.error('File not found on server:', filePath);
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        console.log('File details:', {
            filename: file.filename,
            contentType: file.contentType,
            size: file.data ? file.data.length : 'N/A'
        });
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).json({ message: 'Error retrieving file' });
    }
});

router.get('/print/:id', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const doc = new PDFDocument();

        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=application_${application.customId}.pdf`);

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Load the custom font (Roboto-Regular in this case)
        doc.font(path.join(__dirname, '../../fonts', 'Roboto-Regular.ttf'));

        // Function to format currency
        const formatCurrency = (amount) => {
            // Remove any non-numeric characters except decimal point
            const numericValue = amount.replace(/[^0-9.]/g, '');
            return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(numericValue);
        };

        // Add content to the PDF
        doc.fontSize(18).text('Application Details', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Application ID: ${application.customId}`);
        doc.text(`Status: ${application.status}`);
        doc.text(`Application Type: ${application.applicationType}`);
        doc.text(`Owner Name: ${application.ownerName}`);
        doc.text(`Address: ${application.address}`);
        doc.text(`Phone: ${application.phone}`);
        doc.text(`Date of Submission: ${formatDate(application.dateOfSubmission)}`);
        doc.text(`Date of Acquisition: ${formatDate(application.dateOfAcquisition)}`);

        // Add more fields
        doc.text(`Registration Type: ${application.registrationType}`);
        doc.text(`Chainsaw Store: ${application.chainsawStore}`);
        doc.text(`Brand: ${application.brand}`);
        doc.text(`Model: ${application.model}`);
        doc.text(`Serial Number: ${application.serialNumber}`);
        doc.text(`Power Output (kW/bhp): ${application.powerOutput}`);
        doc.text(`Max Length Guidebar (Inches): ${application.maxLengthGuidebar}`);
        doc.text(`Country of Origin: ${application.countryOfOrigin}`);
        doc.text(`Purchase Price: ₱${formatCurrency(application.purchasePrice)}`);

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.error('Error printing application:', error);
        res.status(500).json({ message: 'Error printing application' });
    }
});

router.put('/update-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status field is required.' });
        }

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        application.reviewNotes = reviewNotes;

        await application.save();

        res.status(200).json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating application status' });
    }
});

router.put('/return-application/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { returnRemarks } = req.body;
        const adminId = req.user.id;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        application.status = 'Returned';
        application.returnRemarks = returnRemarks;
        application.reviewedBy = `${admin.firstName} ${admin.lastName}`.trim();
        await application.save();

        // Create a notification for the user
        const notification = new UserNotification({
            userId: application.userId,
            message: `Your application ${application.customId} has been returned. Remarks: ${returnRemarks}`,
            applicationId: application._id,
            type: 'application_returned'
        });
        await notification.save();

        res.status(200).json({ success: true, message: 'Application returned successfully', application });
    } catch (error) {
        console.error('Error returning application:', error);
        res.status(500).json({ success: false, message: 'Error returning application', error: error.message });
    }
});

router.post('/review-application/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'No authorization header provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('JWT verification error:', error);
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const adminId = decoded.id;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        application.status = 'In Progress';
        application.reviewedBy = `${admin.firstName} ${admin.lastName}`.trim();
        await application.save();

        // Create a notification for the user
        const notification = new UserNotification({
            userId: application.userId,
            message: `Your application ${application.customId} is now In Progress and being reviewed by ${application.reviewedBy}.`,
            applicationId: application._id,
            type: 'application_in_progress'
        });
        await notification.save();

        res.json({ success: true, message: 'Application marked as In Progress', application });
    } catch (error) {
        console.error('Error marking application for review:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/undo-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({ message: 'New status is required.' });
        }

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = newStatus;
        await application.save();

        res.status(200).json({ success: true, message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error undoing application status:', error);
        res.status(500).json({ success: false, message: 'Error undoing application status' });
    }
});

module.exports = { router };