const OrderOfPayment = require('../../models/ChiefRPS_models/OrderOfPaymentSchema');
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
            date,
            address,
            natureOfApplication,
            items,
            totalAmount,
            signatures,
            paymentDate,
            receiptDate
        } = req.body;

        const newOrderOfPayment = new OrderOfPayment({
            applicationId,
            applicantName,
            billNo,
            dateCreated: date,
            address,
            natureOfApplication,
            items,
            totalAmount,
            status: 'Pending Signature', // Change this to 'Pending Signature'
            signatures,
            paymentDate,
            receiptDate
        });

        console.log('New Order of Payment object:', newOrderOfPayment);

        const savedOrderOfPayment = await newOrderOfPayment.save();

        // Don't update the application status here

        res.status(201).json({ orderOfPayment: savedOrderOfPayment });
    } catch (error) {
        console.error('Error creating order of payment:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ message: 'Validation error', errors: validationErrors });
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
        // Store the signature image if needed
        // orderOfPayment.signatureImages[signatureType] = signature;
        if (orderOfPayment.signatures.chiefRPS && orderOfPayment.signatures.technicalServices) {
            orderOfPayment.status = 'Awaiting Payment';

            // Update the application status to "Awaiting Payment"
            const updatedApplication = await Application.findOneAndUpdate(
                { customId: orderOfPayment.applicationId },
                { status: 'Awaiting Payment' },
                { new: true }
            );

            if (!updatedApplication) {
                console.log('Application not found:', orderOfPayment.applicationId);
                return res.status(404).json({ message: 'Application not found' });
            }

            console.log('Updated application:', updatedApplication);
        }
        await orderOfPayment.save();
        res.json(orderOfPayment);
    } catch (error) {
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
        orderOfPayment.paymentDate = new Date();
        orderOfPayment.receiptNumber = receiptNumber;
        await orderOfPayment.save();
        res.json(orderOfPayment);
    } catch (error) {
        res.status(400).json({ message: 'Error confirming payment', error: error.message });
    }
};

module.exports = {
    getAllOrderOfPayments,
    createOrderOfPayment,
    getOrderOfPaymentById,
    updateOrderOfPayment,
    signOrderOfPayment,
    confirmPayment
};
