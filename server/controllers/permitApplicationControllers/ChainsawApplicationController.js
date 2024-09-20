const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../../models/PermitApplications/ChainsawApplication');
const Notification = require('../../models/User/Notification');
const Counter = require('../../models/admin/counter');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // const uploadPath = path.join(__dirname, '../../uploads/chainsaw');
        // if (!fs.existsSync(uploadPath)) {
        //     fs.mkdirSync(uploadPath, { recursive: true });
        // }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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
    // const uploadMiddleware = upload.fields([
    //     { name: 'specialPowerOfAttorney', maxCount: 5 },
    //     { name: 'forestTenureAgreement', maxCount: 5 },
    //     { name: 'businessPermit', maxCount: 5 },
    //     { name: 'certificateOfRegistration', maxCount: 5 },
    //     { name: 'woodProcessingPlantPermit', maxCount: 5 }
    // ]);

    // uploadMiddleware(req, res, async (err) => {
    //     if (err) {
    //         console.error('Error in uploadMiddleware:', err);
    //         return res.status(400).json({ error: err.message });
    //     }

    try {
        // Log the received form data and files
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
            // isOwner,
            // isTenureHolder,
            // isBusinessOwner,
            // isPLTPRHolder,
            // isWPPHolder
        } = req.body;

        // Ensure dateOfSubmission is a valid date
        const parsedDateOfSubmission = new Date(dateOfSubmission);
        if (isNaN(parsedDateOfSubmission)) {
            throw new Error('Invalid dateOfSubmission');
        }

        const customId = await CSAW_CustomId();

        // const files = {};
        // for (const field in req.files) {
        //     files[field] = req.files[field].map(file => ({
        //         filename: file.filename,
        //         path: file.path
        //     }));
        // }

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
        // Ensure files are sent as an array of filenames for rendering
        const formattedFiles = Object.keys(files).reduce((acc, key) => {
            acc[key] = files[key].map(file => file.filename); // Only keep filenames
            return acc;
        }, {});

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
            // isOwner: isOwner === 'true',
            // isTenureHolder: isTenureHolder === 'true',
            // isBusinessOwner: isBusinessOwner === 'true',
            // isPLTPRHolder: isPLTPRHolder === 'true',
            // isWPPHolder: isWPPHolder === 'true',
            files: formattedFiles, // Use formatted files
            userId: req.user.id
        });

        await newApplication.save();
        res.status(201).json({ message: 'Application created successfully', application: newApplication });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ error: error.message });
    }
    // });
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
            status,
            // isOwner,
            // isTenureHolder,
            // isBusinessOwner,
            // isPLTPRHolder,
            // isWPPHolder
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
    submitDraft
};
