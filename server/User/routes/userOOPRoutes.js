const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { getUserOOP, simulatePayment, uploadReceipt, submitProofOfPayment } = require('../controllers/userOOPControllers');

router.get('/oop/:applicationId', getUserOOP);
router.post('/oop/:applicationId/simulate-payment', simulatePayment);
router.post('/oop/:applicationId/upload-receipt', upload.single('receipt'), uploadReceipt);
router.post('/oop/:applicationId/submit-proof', upload.single('proofOfPayment'), submitProofOfPayment);

module.exports = router;
