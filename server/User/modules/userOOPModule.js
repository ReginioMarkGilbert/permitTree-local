const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OrderOfPayment = require('../../Admin/AdminModules/orderOfPaymentModule');
const { Application } = require('./PermitApplicationsModules/chainsawApplicationModule');
const { generateReceipt } = require('../../utils/receiptGenerator');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Schema (if needed, but we're using ChiefOrderOfPaymentSchema)
// const userOOPSchema = new mongoose.Schema({
// Define schema here if needed
// });

// const UserOOP = mongoose.model('UserOOP', userOOPSchema);

// Combined route handlers and routes
router.get('/user/getAllOOP')


router.get('/oop/:applicationId', authenticateToken, async (req, res) => {
   try {
      const { applicationId } = req.params;
      const oop = await OrderOfPayment.findOne({ applicationId });

      if (!oop) {
         return res.status(404).json({ message: 'Order of Payment not found' });
      }

      // Check if the OOP belongs to the authenticated user
      const application = await Application.findOne({ customId: applicationId });
      if (!application || application.userId.toString() !== req.user.id) {
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

router.get('/user/oop', authenticateToken, async (req, res) => {
   try {
      const { status } = req.query;
      const userId = req.user.id;

      let query = { userId: userId };
      if (status) {
         query.status = status;
      }

      const orderOfPayments = await OrderOfPayment.find(query);
      res.json(orderOfPayments);

   } catch (error) {
      console.error('User side Error fetching order of payments:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
   }
});

router.get('/oop', authenticateToken, async (req, res) => {
   try {
      const userId = req.user.id;
      const { status } = req.query;

      // Find all applications for the user
      const userApplications = await Application.find({ userId });
      const applicationIds = userApplications.map(app => app.customId);

      // Construct the query
      let query = { applicationId: { $in: applicationIds } };
      if (status) {
         query.status = status;
      }

      const orderOfPayments = await OrderOfPayment.find(query);
      res.json(orderOfPayments);
   } catch (error) {
      console.error('Error fetching user order of payments:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
   }
});

router.get('/oop-by-billno/:billNo', authenticateToken, async (req, res) => {
  try {
    const { billNo } = req.params;
    const oop = await OrderOfPayment.findOne({ billNo });

    if (!oop) {
      return res.status(404).json({ message: 'Order of Payment not found' });
    }

    // Check if the OOP belongs to the authenticated user
    const application = await Application.findOne({ customId: oop.applicationId });
    if (!application || application.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this Order of Payment' });
    }

    res.json(oop);
  } catch (error) {
    console.error('Error fetching Order of Payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = {
   router
};
