const mongoose = require('mongoose');

// Import all permit application schemas
const ChainsawApplication = require('../../models/PermitApplications/ChainsawApplicationSchema');
// Import other permit schemas as they are created
// const PtprApplication = require('../../models/PermitApplications/PtprApplicationSchema');
// const WppApplication = require('../../models/PermitApplications/WppApplicationSchema');

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
