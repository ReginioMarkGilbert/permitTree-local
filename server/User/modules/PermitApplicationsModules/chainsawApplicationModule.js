const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const { authenticateToken } = require('../../../middleware/authMiddleware');

// Schema
const ChainsawApplicationSchema = new mongoose.Schema({
    customId: { type: String, unique: true },
    applicationType: { type: String, default: 'Chainsaw Registration', required: true },
    registrationType: { type: String, required: true },
    chainsawStore: { type: String, required: true },
    ownerName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, required: true },
    dateOfAcquisition: { type: Date, required: true },
    powerOutput: { type: String, required: true },
    maxLengthGuidebar: { type: String, required: true },
    countryOfOrigin: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    files: {
        officialReceipt: [{ filename: String, contentType: String, data: Buffer }],
        deedOfSale: [{ filename: String, contentType: String, data: Buffer }],
        specialPowerOfAttorney: [{ filename: String, contentType: String, data: Buffer }],
        forestTenureAgreement: [{ filename: String, contentType: String, data: Buffer }],
        businessPermit: [{ filename: String, contentType: String, data: Buffer }],
        certificateOfRegistration: [{ filename: String, contentType: String, data: Buffer }],
        woodProcessingPlantPermit: [{ filename: String, contentType: String, data: Buffer }]
    },
    dateOfSubmission: { type: Date, required: true },
    status: { type: String, required: true },
    uploadedRequirements: { type: String, default: 'No' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isOwner: { type: Boolean, default: false },
    isTenureHolder: { type: Boolean, default: false },
    isBusinessOwner: { type: Boolean, default: false },
    isPLTPRHolder: { type: Boolean, default: false },
    isWPPHolder: { type: Boolean, default: false },
    reviewedBy: { type: String }
}, { timestamps: true });

const Application = mongoose.model('ChainsawApplication', ChainsawApplicationSchema);

// Counter model
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

// Helper function
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

// Route handlers
router.post('/csaw_createApplication', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // console.log('Request body:', req.body);
        // console.log('Request files:', req.files);

        const {
            applicationType = 'Chainsaw Registration',
            registrationType, chainsawStore, ownerName, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, maxLengthGuidebar,
            countryOfOrigin, purchasePrice, dateOfSubmission, status, isOwner, isTenureHolder, isBusinessOwner, isPLTPRHolder, isWPPHolder
        } = req.body;

        const parsedDateOfSubmission = new Date(dateOfSubmission);
        if (isNaN(parsedDateOfSubmission)) {
            throw new Error('Invalid dateOfSubmission');
        }

        const customId = await CSAW_CustomId();
        // Process uploaded files
        const files = {};
        if (req.files) {
            for (const [key, fileData] of Object.entries(req.files)) {
                if (Array.isArray(fileData)) {
                    files[key] = fileData.map(file => ({
                        filename: file.name,
                        contentType: file.mimetype,
                        data: file.data
                    }));
                } else if (fileData && typeof fileData === 'object') {
                    files[key] = [{
                        filename: fileData.name,
                        contentType: fileData.mimetype,
                        data: fileData.data
                    }];
                }
            }
        }
        // Create new application
        const newApplication = new Application({
            customId, applicationType, registrationType, chainsawStore, ownerName, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, maxLengthGuidebar, countryOfOrigin, purchasePrice,
            dateOfSubmission: parsedDateOfSubmission,
            status,
            isOwner: isOwner === 'true',
            isTenureHolder: isTenureHolder === 'true',
            isBusinessOwner: isBusinessOwner === 'true',
            isPLTPRHolder: isPLTPRHolder === 'true',
            isWPPHolder: isWPPHolder === 'true',
            files,
            userId: req.user.id
        });

        await newApplication.save();
        res.status(201).json({ message: 'Application created successfully', application: newApplication });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/csaw_saveDraft', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const customId = await CSAW_CustomId();
        console.log('Generated customId:', customId);

        const applicationData = {
            ...req.body,
            customId: customId,
            userId: req.user._id,
            status: 'Draft'
        };

        // Handle file uploads
        const fileFields = ['officialReceipt', 'deedOfSale', 'specialPowerOfAttorney', 'forestTenureAgreement', 'businessPermit', 'certificateOfRegistration', 'woodProcessingPlantPermit'];
        applicationData.files = {};

        for (const field of fileFields) {
            if (req.files && req.files[field]) {
                const fileArray = Array.isArray(req.files[field]) ? req.files[field] : [req.files[field]];
                applicationData.files[field] = fileArray.map(file => ({
                    filename: file.name,
                    data: file.data,
                    contentType: file.mimetype
                }));
            }
        }

        const newApplication = new Application(applicationData);
        await newApplication.save();

        res.status(201).json({ message: 'Draft saved successfully', application: newApplication });
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ message: 'Error saving draft', error: error.message });
    }
});

router.get('/getAllApplications', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { sort, status, applicationType } = req.query;
        let filter = { userId: req.user.id };

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
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(400).json({ error: err.message });
    }
});

router.put('/csaw_updateApplication/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        updateData.userId = req.user.id;

        if (updateData.files) {
            for (const [documentType, fileArray] of Object.entries(updateData.files)) {
                updateData.files[documentType] = fileArray.map(file => ({
                    filename: file.filename,
                    contentType: file.contentType,
                    data: Buffer.from(file.data, 'base64')
                }));
            }
        }

        const updatedApplication = await Application.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            updateData,
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ error: 'Application not found or you do not have permission to update it' });
        }

        res.status(200).json(updatedApplication);
    } catch (err) {
        console.error('Error updating application:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/csaw_deleteApplication/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findOne({ _id: id, userId: req.user.id });

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found or you do not have permission to delete it' });
        }

        if (application.status !== 'Draft') {
            return res.status(400).json({ success: false, error: 'Only draft applications can be deleted' });
        }

        await Application.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Application deleted successfully' });
    } catch (err) {
        console.error('Error deleting application:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});


router.post('/resetCounterChainsaw', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});


router.get('/csaw_getApplicationById/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});

router.put('/csaw_unsubmitApplication/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        if (application.status !== 'Submitted') {
            return res.status(400).json({ success: false, message: 'Only submitted applications can be unsubmitted' });
        }
        application.status = 'Draft';
        await application.save();
        res.json({ success: true, message: 'Application unsubmitted successfully', application });
    } catch (error) {
        console.error('Error unsubmitting application:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/csaw_submitDraft/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        if (application.status !== 'Draft') {
            return res.status(400).json({ success: false, message: 'Only draft applications can be submitted' });
        }
        if (application.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to submit this application' });
        }
        application.status = 'Submitted';
        application.dateOfSubmission = new Date();
        await application.save();
        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting draft application:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/csaw_submitReturnedApplication/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to submit this application' });
        }

        if (application.status !== 'Returned') {
            return res.status(400).json({ success: false, message: 'Application is not in Returned status' });
        }

        application.status = 'Submitted';
        application.dateOfSubmission = new Date();
        await application.save();

        res.json({ success: true, message: 'Application resubmitted successfully' });
    } catch (error) {
        console.error('Error resubmitting application:', error);
        res.status(500).json({ success: false, message: 'Error resubmitting application' });
    }
});

module.exports = {
    router,
    Application
};