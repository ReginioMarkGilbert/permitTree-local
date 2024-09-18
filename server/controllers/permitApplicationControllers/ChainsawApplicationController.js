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

const CSAW_CustomId = async () => {
    try {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'applicationId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const id = String(counter.seq).padStart(6, '0');

        const customId = `PMDQ-CSAW-${year}-${month}${day}-${id}`;
        console.log('Generated customId:', customId);
        return customId;
    } catch (error) {
        console.error('Error generating customId:', error);
        throw error;
    }
};

const csaw_createApplication = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        const {
            applicationType = 'Chainsaw Registration',
            registrationType,
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
            dateOfSubmission,
            status
        } = req.body;

        // Ensure dateOfSubmission is a valid date
        const parsedDateOfSubmission = new Date(dateOfSubmission);
        if (isNaN(parsedDateOfSubmission)) {
            throw new Error('Invalid dateOfSubmission');
        }

        // Generate customId
        const customId = await CSAW_CustomId();

        // Process uploaded files
        let files = [];
        if (req.files && req.files.files) {
            const uploadedFiles = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
            files = uploadedFiles.map(file => ({
                filename: file.name,
                contentType: file.mimetype,
                data: file.data
            }));
        }

        // Create a new application
        const newApplication = new Application({
            customId,
            applicationType,
            registrationType,
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
            dateOfSubmission: parsedDateOfSubmission,
            status,
            files,
            userId: req.user.id
        });

        // Save the application to the database
        await newApplication.save();
        console.log('Application saved:', newApplication);

        res.status(201).json({ message: 'Application created successfully', application: newApplication });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ error: error.message });
    }
};

const csaw_saveDraft = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        const {
            applicationType = 'Chainsaw Registration',
            registrationType,
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
            dateOfSubmission,
            status
        } = req.body;

        // Ensure dateOfSubmission is a valid date
        const parsedDateOfSubmission = new Date(dateOfSubmission);
        if (isNaN(parsedDateOfSubmission)) {
            throw new Error('Invalid dateOfSubmission');
        }

        // Generate customId
        const customId = await CSAW_CustomId();

        // Process uploaded files
        let files = [];
        if (req.files && req.files.files) {
            const uploadedFiles = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
            files = uploadedFiles.map(file => ({
                filename: file.name,
                contentType: file.mimetype,
                data: file.data
            }));
        }

        // Create a new draft application
        const newDraft = new Application({
            customId,
            applicationType,
            registrationType,
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
            dateOfSubmission: parsedDateOfSubmission,
            status: 'Draft',
            files,
            userId: req.user.id
        });

        // Save the draft to the database
        await newDraft.save();
        console.log('Draft saved:', newDraft);

        res.status(201).json({ message: 'Draft saved successfully', application: newDraft });
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ error: error.message });
    }
};

const csaw_getApplications = async (req, res) => {
    try {
        const { sort, status } = req.query;
        let filter = { userId: req.user.id }; // Filter by the logged-in user's ID

        if (status) {
            // Check if status is an array and handle accordingly
            if (Array.isArray(status)) {
                filter.status = { $in: status.map(s => new RegExp(`^${s}$`, 'i')) };
            } else {
                filter.status = { $regex: new RegExp(`^${status}$`, 'i') };
            }
        }

        let sortOption = {};

        if (sort === 'date-asc') {
            sortOption.dateOfSubmission = 1;
        } else if (sort === 'date-desc') {
            sortOption.dateOfSubmission = -1;
        }

        // console.log('Filter:', filter);
        // console.log('Sort Option:', sortOption);

        const applications = await Application.find(filter).sort(sortOption);
        // console.log('Applications Fetched:', applications);
        res.status(200).json(applications);
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(400).json({ error: err.message });
    }
};

const csaw_updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { registrationType, chainsawStore, ownerName, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, maxLengthGuidebar, countryOfOrigin, purchasePrice, status, dateOfSubmission } = req.body;
        const updatedApplication = await Application.findByIdAndUpdate(id, { registrationType, chainsawStore, ownerName, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, maxLengthGuidebar, countryOfOrigin, purchasePrice, status, dateOfSubmission }, { new: true });
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

const resetCounter = async (req, res) => {
    try {
        await Counter.findOneAndUpdate(
            { _id: 'applicationId' },
            { seq: 0 },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Counter reset successfully' });
    } catch (error) {
        console.error('Error resetting counter:', error);
        res.status(500).json({ error: 'Failed to reset counter' });
    }
};

// Add this new function
const csaw_getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.status(200).json(application);
    } catch (err) {
        console.error('Error fetching application:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    csaw_createApplication,
    csaw_getApplications,
    csaw_updateApplication,
    csaw_deleteApplication,
    csaw_saveDraft,
    resetCounter,
    csaw_getApplicationById  // Make sure this line is added
};
