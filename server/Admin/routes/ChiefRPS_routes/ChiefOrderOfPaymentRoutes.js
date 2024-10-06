const express = require('express');
const router = express.Router();
const { getAllOrderOfPayments, createOrderOfPayment, getOrderOfPaymentById, updateOrderOfPayment, signOrderOfPayment, confirmPayment, getOrderOfPaymentByApplicationId, reviewProofOfPayment } = require('../../controllers/ChiefRPS_controllers/ChiefOrderOfPaymentControllers');

router.get('/order-of-payments', getAllOrderOfPayments);
router.post('/order-of-payments', createOrderOfPayment);
router.get('/order-of-payments/:id', getOrderOfPaymentById);
router.put('/order-of-payments/:id', updateOrderOfPayment);
router.put('/order-of-payments/:id/sign', signOrderOfPayment);
router.put('/order-of-payments/:id/confirm-payment', confirmPayment);
router.get('/order-of-payments/by-application/:applicationId', getOrderOfPaymentByApplicationId);
router.put('/order-of-payments/:id/review-proof', reviewProofOfPayment);

module.exports = router;
