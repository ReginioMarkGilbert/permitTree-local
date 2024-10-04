const OrderOfPayment = require('../../models/ChiefRPS_models/OrderOfPaymentSchema');

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
        const newOrderOfPayment = new OrderOfPayment(req.body);
        await newOrderOfPayment.save();
        res.status(201).json(newOrderOfPayment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating order of payment', error: error.message });
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
        const { signatureType } = req.body;
        const orderOfPayment = await OrderOfPayment.findById(req.params.id);
        if (!orderOfPayment) {
            return res.status(404).json({ message: 'Order of payment not found' });
        }
        orderOfPayment.signatures[signatureType] = new Date();
        if (orderOfPayment.signatures.chiefRPS && orderOfPayment.signatures.technicalServices) {
            orderOfPayment.status = 'Awaiting Payment';
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
