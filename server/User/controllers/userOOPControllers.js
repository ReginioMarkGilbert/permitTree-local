const OrderOfPayment = require('../../Admin/models/ChiefRPS_models/ChiefOrderOfPaymentSchema');
const Application = require('../../User/models/PermitApplications/ChainsawApplicationSchema');

const getUserOOP = async (req, res) => {
  try {
    const { applicationId } = req.params;
    console.log('Fetching OOP for applicationId:', applicationId);

    const oop = await OrderOfPayment.findOne({ applicationId });
    console.log('Found OOP:', oop);

    if (!oop) {
      return res.status(404).json({ message: 'Order of Payment not found' });
    }

    // Fetch the associated application to check user authorization
    const application = await Application.findOne({ customId: applicationId });
    console.log('Associated application:', application);

    if (!application) {
      return res.status(404).json({ message: 'Associated application not found' });
    }

    // Check if the user is authorized to view this OOP
    if (req.user && application.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this Order of Payment' });
    }

    res.json(oop);
  } catch (error) {
    console.error('Error fetching Order of Payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserOOP,
};
