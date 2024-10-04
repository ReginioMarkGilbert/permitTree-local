const express = require('express');
const router = express.Router();
// const OrderOfPaymentController = require('../../controllers/ChiefRPS_controllers/OrderOfPaymentControllers');
// const authMiddleware = require('../../middleware/authMiddleware');
const { getAllOrderOfPayments, createOrderOfPayment, getOrderOfPaymentById, updateOrderOfPayment, signOrderOfPayment, confirmPayment } = require('../../controllers/ChiefRPS_controllers/OrderOfPaymentControllers');
// router.use(authMiddleware);

router.get('/order-of-payments', getAllOrderOfPayments);
router.post('/order-of-payments', createOrderOfPayment);
router.get('/order-of-payments/:id', getOrderOfPaymentById);
router.put('/order-of-payments/:id', updateOrderOfPayment);
router.put('/order-of-payments/:id/sign', signOrderOfPayment);
router.put('/order-of-payments/:id/confirm-payment', confirmPayment);

module.exports = router;
