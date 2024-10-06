const express = require('express');
const router = express.Router();
const { getUserOOP, simulatePayment, uploadReceipt, submitProofOfPayment } = require('../controllers/userOOPControllers');

router.get('/oop/:applicationId', getUserOOP);
router.post('/oop/:applicationId/simulate-payment', simulatePayment);
router.post('/oop/:applicationId/upload-receipt', uploadReceipt);
router.post('/oop/:applicationId/submit-proof', submitProofOfPayment);

module.exports = router;
