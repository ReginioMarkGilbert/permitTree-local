const Application = require('../../models/PermitApplications/ChainsawApplication');
const User = require('../../models/User/userAuthSchema');

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

module.exports = {
    getAllApplications
};
