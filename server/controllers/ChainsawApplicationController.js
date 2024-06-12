const Application = require('../models/ChainsawApplication');
const Notification = require('../models/Notification');
const Counter = require('../models/admin/counter');

const csaw_createApplication = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Log the request body
        const { name, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, fileNames, store } = req.body;

        // Generate custom ID
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const counter = await Counter.findOneAndUpdate(
            { name: 'applicationId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const year = new Date().getFullYear();
        const customId = `PMDQ-CSAW-${year}-${String(counter.seq).padStart(6, '0')}`;

        const dateOfSubmission = new Date();
        const newApplication = new Application({
            customId, name, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, fileNames, store, dateOfSubmission
        });
        const savedApplication = await newApplication.save();

        const notification = new Notification({
            message: 'Your application was successfully submitted.'
        });
        await notification.save();
        console.log('Notification created:', notification); // Log the notification

        res.status(201).json(savedApplication);
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
        const { name, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, status, fileNames, store } = req.body;
        const updatedApplication = await Application.findByIdAndUpdate(id, { name, address, phone, brand, model, serialNumber, dateOfAcquisition, powerOutput, status, fileNames, store }, { new: true });
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
    csaw_deleteApplication
};
