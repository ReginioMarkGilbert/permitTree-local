const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { OrderOfPayment } = require('../../Admin/AdminModules/chiefOrderOfPaymentModule');
const { Application } = require('./PermitApplicationsModules/chainsawApplicationModule');
const { generateReceipt } = require('../../utils/receiptGenerator');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Schema (if needed, but we're using ChiefOrderOfPaymentSchema)
// const userOOPSchema = new mongoose.Schema({
// Define schema here if needed
// });

// const UserOOP = mongoose.model('UserOOP', userOOPSchema);

// Combined route handlers and routes
router.get('/oop/:applicationId', authenticateToken, async (req, res) => {
    try {
        const { applicationId } = req.params;
        console.log('Fetching OOP for applicationId:', applicationId);

        const oop = await OrderOfPayment.findOne({ applicationId });
        console.log('Found OOP:', oop);

        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        const application = await Application.findOne({ customId: applicationId });
        console.log('Associated application:', application);

        if (!application) {
            return res.status(404).json({ message: 'Associated application not found' });
        }

        if (application.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this Order of Payment' });
        }

        res.json(oop);
    } catch (error) {
        console.error('Error fetching Order of Payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/oop/:applicationId/simulate-payment', authenticateToken, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const oop = await OrderOfPayment.findOne({ applicationId });

        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        oop.status = 'Awaiting Payment';
        oop.paymentDate = new Date();
        await oop.save();

        const application = await Application.findOne({ customId: applicationId });
        if (application) {
            application.status = 'Awaiting Payment';
            await application.save();
        }

        const receiptPdf = await generateReceipt(oop);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=receipt_${oop.billNo}.pdf`);
        res.send(receiptPdf);
    } catch (error) {
        console.error('Error simulating payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/oop/:applicationId/upload-receipt', authenticateToken, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const oop = await OrderOfPayment.findOne({ applicationId });

        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        if (!req.files || !req.files.receipt) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const receiptFile = req.files.receipt;

        oop.receiptFile = {
            filename: receiptFile.name,
            contentType: receiptFile.mimetype,
            data: receiptFile.data
        };
        await oop.save();

        res.json({ message: 'Receipt uploaded successfully' });
    } catch (error) {
        console.error('Error uploading receipt:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/oop/:applicationId/submit-proof', authenticateToken, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { orNumber, proofOfPayment } = req.body;
        const oop = await OrderOfPayment.findOne({ applicationId });

        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        if (!proofOfPayment) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        oop.orNumber = orNumber;
        oop.proofOfPayment = {
            _id: new mongoose.Types.ObjectId(),
            filename: proofOfPayment.filename,
            contentType: proofOfPayment.contentType,
            data: Buffer.from(proofOfPayment.data, 'base64')
        };
        oop.status = 'Payment Proof Submitted';
        await oop.save();

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
});

module.exports = {
    router
};