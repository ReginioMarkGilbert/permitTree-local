const OrderOfPayment = require('../../models/ChiefRPS_models/ChiefOrderOfPaymentSchema');
const Application = require('../../../User/models/PermitApplications/ChainsawApplicationSchema'); // Import the Application model

const getAllOrderOfPayments = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const orderOfPayments = await OrderOfPayment.find(query);
        res.json(orderOfPayments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order of payments', error: error.message });
    }
};

const createOrderOfPayment = async (req, res) => {
    try {
        console.log('Received data:', req.body);

        const {
            applicationId,
            applicantName,
            billNo,
            address,
            natureOfApplication,
            items,
            totalAmount,
            signatures,
        } = req.body;

        // Check if an OOP with the same billNo already exists
        const existingOOP = await OrderOfPayment.findOne({ billNo });
        if (existingOOP) {
            return res.status(400).json({ message: 'An Order of Payment with this Bill No. already exists' });
        }

        const newOrderOfPayment = new OrderOfPayment({
            applicationId,
            applicantName,
            billNo,
            dateCreated: new Date(),
            address,
            natureOfApplication,
            items,
            totalAmount,
            status: 'Pending Signature',
            signatures,
            statutoryReceiptDate: new Date(), // Set this when creating the OOP
        });

        console.log('New Order of Payment object:', newOrderOfPayment);

        const savedOrderOfPayment = await newOrderOfPayment.save();

        res.status(201).json({ orderOfPayment: savedOrderOfPayment });
    } catch (error) {
        console.error('Error creating order of payment:', error);
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate Bill No. Please use a unique Bill No.' });
        } else {
            res.status(400).json({ message: 'Error creating order of payment', error: error.message });
        }
    }
};

const getOrderOfPaymentById = async (req, res) => {
    try {
        const orderOfPayment = await OrderOfPayment.findById(req.params.id);
        if (!orderOfPayment) {
            return res.status(404).json({ message: 'Order of payment not found' });
        }

        // Convert Buffer to base64 string for the frontend
        if (orderOfPayment.proofOfPayment && orderOfPayment.proofOfPayment.data) {
            orderOfPayment.proofOfPayment.data = orderOfPayment.proofOfPayment.data.toString('base64');
        }

        res.json(orderOfPayment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order of payment', error: error.message });
    }
};

const updateOrderOfPayment = async (req, res) => {
    try {
        const updatedOrderOfPayment = await OrderOfPayment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrderOfPayment) {
            return res.status(404).json({ message: 'Order of payment not found' });
        }
        res.json(updatedOrderOfPayment);
    } catch (error) {
        res.status(400).json({ message: 'Error updating order of payment', error: error.message });
    }
};

const signOrderOfPayment = async (req, res) => {
    try {
        const { signatureType, signature } = req.body;
        const orderOfPayment = await OrderOfPayment.findById(req.params.id);
        if (!orderOfPayment) {
            return res.status(404).json({ message: 'Order of payment not found' });
        }
        orderOfPayment.signatures[signatureType] = new Date();

        if (orderOfPayment.signatures.chiefRPS && orderOfPayment.signatures.technicalServices) {
            orderOfPayment.status = 'Awaiting Payment';

            // Update the corresponding application status
            const application = await Application.findOne({ customId: orderOfPayment.applicationId });
            if (application) {
                application.status = 'Awaiting Payment';
                await application.save();
            }
        }

        await orderOfPayment.save();
        res.json(orderOfPayment);
    } catch (error) {
        console.error('Error signing order of payment:', error);
        res.status(400).json({ message: 'Error signing order of payment', error: error.message });
    }
};

const confirmPayment = async (req, res) => {
    try {
        const { receiptNumber } = req.body;
        const orderOfPayment = await OrderOfPayment.findById(req.params.id);
        if (!orderOfPayment) {
            return res.status(404).json({ message: 'Order of payment not found' });
        }
        orderOfPayment.status = 'Completed';
        orderOfPayment.paymentDate = new Date(); // Set this when confirming payment
        orderOfPayment.receiptNumber = receiptNumber;
        await orderOfPayment.save();
        res.json(orderOfPayment);
    } catch (error) {
        res.status(400).json({ message: 'Error confirming payment', error: error.message });
    }
};

const getOrderOfPaymentByApplicationId = async (req, res) => {
    try {
        const orderOfPayment = await OrderOfPayment.findOne({ applicationId: req.params.applicationId });
        if (!orderOfPayment) {
            return res.status(404).json({ message: 'Order of payment not found for this application' });
        }
        res.json(orderOfPayment);
    } catch (error) {
        console.error('Error fetching order of payment:', error);
        res.status(500).json({ message: 'Error fetching order of payment', error: error.message });
    }
};

const reviewProofOfPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'reject'

        const oop = await OrderOfPayment.findById(id);
        if (!oop) {
            return res.status(404).json({ message: 'Order of Payment not found' });
        }

        if (action === 'approve') {
            oop.status = 'Completed';
            oop.paymentDate = new Date();
        } else if (action === 'reject') {
            oop.status = 'Awaiting Payment';
            oop.orNumber = null;
            oop.proofOfPayment = null;
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await oop.save();

        // Update the application status
        const application = await Application.findOne({ customId: oop.applicationId });
        if (application) {
            application.status = action === 'approve' ? 'Payment Verified' : 'Awaiting Payment';
            await application.save();
        }

        res.json({ message: `Proof of payment ${action}d successfully`, oop });
    } catch (error) {
        console.error('Error reviewing proof of payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add this new function
const getProofOfPaymentFile = async (req, res) => {
    try {
        const { id } = req.params;
        const oop = await OrderOfPayment.findById(id);

        if (!oop || !oop.proofOfPayment) {
            return res.status(404).json({ message: 'Proof of payment not found' });
        }

        const file = oop.proofOfPayment;

        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

        res.send(file.data);
    } catch (error) {
        console.error('Error retrieving proof of payment file:', error);
        res.status(500).json({ message: 'Error retrieving file' });
    }
};

module.exports = {
    getAllOrderOfPayments,
    createOrderOfPayment,
    getOrderOfPaymentById,
    updateOrderOfPayment,
    signOrderOfPayment,
    confirmPayment,
    getOrderOfPaymentByApplicationId,
    reviewProofOfPayment,
    getProofOfPaymentFile
};
