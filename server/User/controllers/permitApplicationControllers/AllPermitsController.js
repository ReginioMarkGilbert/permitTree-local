const mongoose = require('mongoose');
const Application = require('../../models/PermitApplications/PermitApplicationSchema');

// Import all permit application schemas
const ChainsawApplication = require('../../models/PermitApplications/ChainsawApplicationSchema');

const getAllApplications = async (req, res) => {
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
        console.log('Fetched applications:', applications);
        res.status(200).json(applications);
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(400).json({ error: err.message });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const { id, applicationType } = req.params;
        let application;

        if (applicationType) {
            const Model = mongoose.model(applicationType);
            application = await Model.findById(id);
        } else {
            // If applicationType is not specified, search in all collections
            const models = [ChainsawApplication]; // Add other models here as they are created
            for (let Model of models) {
                application = await Model.findById(id);
                if (application) break;
            }
        }

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
    getAllApplications,
    getApplicationById
};
