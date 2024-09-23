const Application = require('../../models/PermitApplications/ChainsawApplication');
const User = require('../../models/User/userAuthSchema');
const Notification = require('../../models/admin/adminNotificationSchema'); // Added import
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');

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

// Get all applications
const getAllApplications = async (req, res) => {
    try {
        const { sort, status, applicationType } = req.query;
        let filter = { status: { $ne: 'Draft' } };

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
};

const getApplicationById = async (req, res) => {
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
};

const getFile = async (req, res) => {
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
};

const printApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Create a new PDF document
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
            const numericAmount = parseFloat(amount.toString().replace(/[^\d.]/g, ''));
            return isNaN(numericAmount) ? '0.00' : numericAmount.toFixed(2);
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
};

const updateApplicationStatus = async (req, res) => {
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
        if (reviewNotes) {
            application.reviewNotes = reviewNotes;
        }

        await application.save();

        // Create a notification for the user
        const notification = new Notification({
            userId: application.userId,
            message: `Your application ${application.customId} status has been updated to ${status}.`,
            applicationId: application._id
        });
        await notification.save();

        res.status(200).json({ message: 'Application status updated successfully', application });
    } catch (error) {
        console.error('Error updating application status:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating application status' });
    }
};

const returnApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { returnRemarks } = req.body;

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = 'Returned';
        application.returnRemarks = returnRemarks;
        await application.save();

        // Create a notification for the user
        const notification = new Notification({
            userId: application.userId,
            message: `Your application ${application.customId} has been returned. Please check the remarks and resubmit.`,
            applicationId: application._id,
            type: 'application_returned'
        });
        await notification.save();

        res.status(200).json({ message: 'Application returned successfully', application });
    } catch (error) {
        console.error('Error returning application:', error);
        res.status(500).json({ message: 'Error returning application' });
    }
};

module.exports = {
    getAllApplications,
    getApplicationById,
    getFile,
    printApplication,
    updateApplicationStatus,
    returnApplication
};
