const multer = require('multer');
const path = require('path');
const Application = require('../../models/PermitApplications/ChainsawApplication');
const Notification = require('../../models/User/Notification');
const Counter = require('../../models/admin/counter');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const csaw_createApplication = async (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        try {
            console.log('Request body:', req.body); // Log the request body

            const { applicationType, chainsawStore, ownerName, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, maxLengthGuidebar, countryOfOrigin, purchasePrice, dateOfSubmission } = req.body;

            // Ensure dateOfSubmission is a valid date
            const parsedDateOfSubmission = Array.isArray(dateOfSubmission) ? new Date(dateOfSubmission[0]) : new Date(dateOfSubmission);

            if (isNaN(parsedDateOfSubmission)) {
                throw new Error('Invalid dateOfSubmission');
            }

            // Create a new application
            const newApplication = new Application({
                applicationType,
                chainsawStore,
                ownerName,
                address,
                phone,
                brand,
                model,
                serialNumber,
                dateOfAcquisition,
                powerOutput,
                maxLengthGuidebar,
                countryOfOrigin,
                purchasePrice,
                dateOfSubmission: parsedDateOfSubmission // Use the parsed date
            });

            // Save the application to the database
            await newApplication.save();

            res.status(201).json({ message: 'Application created successfully', application: newApplication });
        } catch (error) {
            console.error('Error creating application:', error); // Log the error message
            res.status(500).json({ error: error.message });
        }
    });
};

const csaw_saveDraft = async (req, res) => {
    try {
        const { name, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, fileNames, dateOfSubmission } = req.body;

        const newDraft = new Application({
            name, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, fileNames, dateOfSubmission, status: 'Draft'
        });
        const savedDraft = await newDraft.save();

        res.status(201).json(savedDraft);
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({ error: err.message });
    }
};

const csaw_getApplications = async (req, res) => {
    try {
        const { sort } = req.query;
        let sortOption = {};

        if (sort === 'date-asc') {
            sortOption = { dateOfSubmission: 1 };
        } else if (sort === 'date-desc') {
            sortOption = { dateOfSubmission: -1 };
        }

        const applications = await Application.find().sort(sortOption);
        res.status(200).json(applications);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const csaw_updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, phone, chainsawStore, brand, model, serialNumber, dateOfAcquisition, powerOutput, status, dateOfSubmission } = req.body;
        const updatedApplication = await Application.findByIdAndUpdate(id, { name, address, phone, chainsawStore, brand, model, serialNumber, dateOfAcquisition, powerOutput, status, dateOfSubmission }, { new: true });
        if (!updatedApplication) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const notification = new Notification({
            message: `Your application status was updated to ${updatedApplication.status}.`
        });
        await notification.save();
        // console.log('Notification created:', notification); // Log the notification

        res.status(200).json(updatedApplication);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const csaw_deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedApplication = await Application.findByIdAndDelete(id);
        if (!deletedApplication) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    csaw_createApplication,
    csaw_getApplications,
    csaw_updateApplication,
    csaw_deleteApplication,
    csaw_saveDraft
};
