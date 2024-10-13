const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const OrderOfPayment = require('./orderOfPaymentModule');
const { Application } = require('../../User/modules/PermitApplicationsModules/chainsawApplicationModule');

// Helper function to generate custom ID for OOP
const generateOOPCustomId = async () => {
   const count = await OrderOfPayment.countDocuments();
   const date = new Date();
   return `OOP-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${(count + 1).toString().padStart(4, '0')}`;
};

// Routes
router.get('/order-of-payments', authenticateToken, async (req, res) => {
   try {
      const { status } = req.query;
      let query = {};

      if (status) {
         query.status = status;
      }

      const orderOfPayments = await OrderOfPayment.find(query);
      res.json(orderOfPayments);
   } catch (error) {
      console.error('Error fetching order of payments:', error);
      res.status(500).json({ message: 'Error fetching order of payments', error: error.message });
   }
});

// Create a new order of payment
router.post('/order-of-payments', authenticateToken, async (req, res) => {
   try {
      console.log('Creating a new order of payment');
      const application = await Application.findOne({ customId: req.body.applicationId });
      if (!application) {
         console.log('Application not found');
         return res.status(404).json({ message: 'Application not found' });
      }

      const customId = await generateOOPCustomId();
      console.log('Generated custom ID:', customId);
      const newOrderOfPayment = new OrderOfPayment({
         ...req.body,
         customId,
         applicationId: application.customId,
         applicantName: application.ownerName,
         address: application.address,
         natureOfApplication: application.applicationType
      });

      const savedOrderOfPayment = await newOrderOfPayment.save();
      console.log('Saved order of payment:', savedOrderOfPayment);

      // Update the application to reference this OOP
      application.orderOfPaymentId = savedOrderOfPayment._id;
      await application.save();
      console.log('Updated application with order of payment ID:', application.orderOfPaymentId);

      res.status(201).json(savedOrderOfPayment);
   } catch (error) {
      console.error('Error creating order of payment:', error);
      res.status(400).json({ message: 'Error creating order of payment', error: error.message });
   }
});

router.get('/order-of-payments/:id', authenticateToken, async (req, res) => {
   try {
      const orderOfPayment = await OrderOfPayment.findById(req.params.id);
      if (!orderOfPayment) {
         return res.status(404).json({ message: 'Order of payment not found' });
      }
      res.json(orderOfPayment);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching order of payment', error: error.message });
   }
});

router.put('/order-of-payments/:id', authenticateToken, async (req, res) => {
   try {
      const updatedOrderOfPayment = await OrderOfPayment.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedOrderOfPayment) {
         return res.status(404).json({ message: 'Order of payment not found' });
      }
      res.json(updatedOrderOfPayment);
   } catch (error) {
      res.status(400).json({ message: 'Error updating order of payment', error: error.message });
   }
});

router.put('/order-of-payments/:id/sign', authenticateToken, async (req, res) => {
   try {
      const orderOfPayment = await OrderOfPayment.findById(req.params.id);
      if (!orderOfPayment) {
         return res.status(404).json({ message: 'Order of payment not found' });
      }
      orderOfPayment.signatures.chiefRPS = new Date();
      orderOfPayment.status = 'Awaiting Payment';
      const updatedOrderOfPayment = await orderOfPayment.save();
      res.json(updatedOrderOfPayment);
   } catch (error) {
      res.status(400).json({ message: 'Error signing order of payment', error: error.message });
   }
});

router.put('/order-of-payments/:id/confirm-payment', authenticateToken, async (req, res) => {
   try {
      const orderOfPayment = await OrderOfPayment.findById(req.params.id);
      if (!orderOfPayment) {
         return res.status(404).json({ message: 'Order of payment not found' });
      }
      orderOfPayment.status = 'Completed';
      orderOfPayment.paymentDate = new Date();
      const updatedOrderOfPayment = await orderOfPayment.save();
      res.json(updatedOrderOfPayment);
   } catch (error) {
      res.status(400).json({ message: 'Error confirming payment', error: error.message });
   }
});

router.get('/order-of-payments/by-application/:applicationId', authenticateToken, async (req, res) => {
   try {
      const orderOfPayment = await OrderOfPayment.findOne({ applicationId: req.params.applicationId });
      if (!orderOfPayment) {
         return res.status(404).json({ message: 'Order of payment not found for this application' });
      }
      res.json(orderOfPayment);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching order of payment', error: error.message });
   }
});

router.put('/order-of-payments/:id/review-proof', authenticateToken, async (req, res) => {
   try {
      const { isApproved } = req.body;
      const orderOfPayment = await OrderOfPayment.findById(req.params.id);
      if (!orderOfPayment) {
         return res.status(404).json({ message: 'Order of payment not found' });
      }
      orderOfPayment.status = isApproved ? 'Completed' : 'Awaiting Payment';
      const updatedOrderOfPayment = await orderOfPayment.save();
      res.json(updatedOrderOfPayment);
   } catch (error) {
      res.status(400).json({ message: 'Error reviewing proof of payment', error: error.message });
   }
});

module.exports = router;
