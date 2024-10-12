const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Schema
const OrderOfPaymentSchema = new mongoose.Schema({
   applicationId: { type: String, required: true },
   applicantName: { type: String, required: true },
   billNo: { type: String, required: true, unique: true },
   dateCreated: { type: Date, default: Date.now },
   address: { type: String, required: true },
   natureOfApplication: { type: String, required: true },
   status: {
      type: String,
      enum: ['Pending Signature', 'Awaiting Payment', 'Payment Proof Submitted', 'Completed'],
      default: 'Pending Signature'
   },
   totalAmount: { type: Number, required: true },
   items: [{
      legalBasis: String,
      description: String,
      amount: Number
   }],
   signatures: {
      chiefRPS: { type: Date },
      technicalServices: { type: Date }
   },
   statutoryReceiptDate: { type: Date },
   paymentDate: { type: Date },
   receiptDate: { type: Date },
   proofOfPayment: {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      filename: String,
      contentType: String,
      data: Buffer
   },
   orNumber: String
});

const OrderOfPayment = mongoose.model('OrderOfPayment', OrderOfPaymentSchema);

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

router.post('/order-of-payments', authenticateToken, async (req, res) => {
   try {
      const newOrderOfPayment = new OrderOfPayment(req.body);
      const savedOrderOfPayment = await newOrderOfPayment.save();
      res.status(201).json(savedOrderOfPayment);
   } catch (error) {
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

router.get('/order-of-payments/:id/proof-of-payment', authenticateToken, async (req, res) => {
   try {
      const orderOfPayment = await OrderOfPayment.findById(req.params.id);
      if (!orderOfPayment || !orderOfPayment.proofOfPayment) {
         return res.status(404).json({ message: 'Proof of payment not found' });
      }
      res.set('Content-Type', orderOfPayment.proofOfPayment.contentType);
      res.send(orderOfPayment.proofOfPayment.data);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching proof of payment', error: error.message });
   }
});

module.exports = {
   router,
   OrderOfPayment
};
