const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../../models/PermitApplications/ChainsawApplication');
const Notification = require('../../models/User/Notification');
const Counter = require('../../models/PermitApplications/PermitIDCounters/CSAWcounter');

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
            status,
            isOwner,
            isTenureHolder,
            isBusinessOwner,
            isPLTPRHolder,
            isWPPHolder
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
            isOwner,
            isTenureHolder,
            isBusinessOwner,
            isPLTPRHolder,
            isWPPHolder
        } = req.body;

        const parsedDateOfSubmission = new Date(dateOfSubmission);
        if (isNaN(parsedDateOfSubmission)) {
            throw new Error('Invalid dateOfSubmission');
        }

        const customId = await CSAW_CustomId();

        // Process uploaded files
        const files = {};
        if (req.files) {
            for (const [key, fileArray] of Object.entries(req.files)) {
                files[key] = fileArray.map(file => ({
                    filename: file.name,
                    contentType: file.mimetype,
                    data: file.data
                }));
            }
        }

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
            isOwner: isOwner === 'true',
            isTenureHolder: isTenureHolder === 'true',
            isBusinessOwner: isBusinessOwner === 'true',
            isPLTPRHolder: isPLTPRHolder === 'true',
            isWPPHolder: isWPPHolder === 'true',
            files,
            userId: req.user.id
        });

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
};

const csaw_updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Ensure the user can only update their own applications
        updateData.userId = req.user.id;

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
        res.status(400).json({ error: err.message });
    }
};

const csaw_deleteApplication = async (req, res) => {
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

// Add this new function
const unsubmitApplication = async (req, res) => {
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
};

const submitDraft = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        if (application.status !== 'Draft') {
            return res.status(400).json({ success: false, message: 'Only draft applications can be submitted' });
        }
        application.status = 'Submitted';
        application.dateOfSubmission = new Date();
        await application.save();
        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting draft application:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    csaw_createApplication,
    csaw_getApplications,
    csaw_updateApplication,
    csaw_deleteApplication,
    csaw_saveDraft,
    resetCounter,
    csaw_getApplicationById,
    unsubmitApplication,
    submitDraft
};
