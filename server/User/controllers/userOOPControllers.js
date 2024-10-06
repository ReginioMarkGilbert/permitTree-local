const OrderOfPayment = require('../../Admin/models/ChiefRPS_models/ChiefOrderOfPaymentSchema');
const Application = require('../../User/models/PermitApplications/ChainsawApplicationSchema');
const { generateReceipt } = require('../../utils/receiptGenerator');

const getUserOOP = async (req, res) => {
    try {
        const { applicationId } = req.params;
        console.log('Fetching OOP for applicationId:', applicationId);

        const oop = await OrderOfPayment.findOne({ applicationId });
        console.log('Found OOP:', oop);

        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        // Fetch the associated application to check user authorization
        const application = await Application.findOne({ customId: applicationId });
        console.log('Associated application:', application);

        if (!application) {
            return res.status(404).json({ message: 'Associated application not found' });
        }

        // Check if the user is authorized to view this OOP
        if (req.user && application.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this Order of Payment' });
        }

        res.json(oop);
    } catch (error) {
        console.error('Error fetching Order of Payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const simulatePayment = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const oop = await OrderOfPayment.findOne({ applicationId });

        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        oop.status = 'Awaiting Payment';
        oop.paymentDate = new Date();
        // If you want to save the receipt number to db, generate it here and save it
        // oop.receiptNumber = generateReceiptNumber();
        await oop.save();

        // Update the application status
        const application = await Application.findOne({ customId: applicationId });
        if (application) {
            application.status = 'Awaiting Payment';
            await application.save();
        }

        // Generate receipt
        const receiptPdf = await generateReceipt(oop);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=receipt_${oop.billNo}.pdf`);
        res.send(receiptPdf);
    } catch (error) {
        console.error('Error simulating payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const uploadReceipt = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const oop = await OrderOfPayment.findOne({ applicationId });

        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        oop.receiptFile = {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer
        };
        await oop.save();

        res.json({ message: 'Receipt uploaded successfully' });
    } catch (error) {
        console.error('Error uploading receipt:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const submitProofOfPayment = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { orNumber } = req.body;
        const oop = await OrderOfPayment.findOne({ applicationId });

        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        oop.orNumber = orNumber;
        oop.proofOfPayment = {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer
        };
        oop.status = 'Payment Proof Submitted';
        await oop.save();

        // Update the application status
        const application = await Application.findOne({ customId: applicationId });
        if (application) {
            application.status = 'Payment Proof Submitted';
            await application.save();
        }

        res.json({ message: 'Proof of payment submitted successfully' });
    } catch (error) {
        console.error('Error submitting proof of payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUserOOP,
    simulatePayment,
    uploadReceipt,
    submitProofOfPayment
};
