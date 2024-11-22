const OOP = require('../models/OOP');

const generateORNumber = async () => {
   try {
      // Get the current year
      const currentYear = new Date().getFullYear();

      // Find the latest OR number for the current year
      const latestOR = await OOP.findOne({
         'officialReceipt.orNumber': new RegExp(`^OR-${currentYear}-`)
      }).sort({ 'officialReceipt.orNumber': -1 });

      let nextNumber = 1;
      if (latestOR && latestOR.officialReceipt) {
         // Extract the number from the latest OR number
         const match = latestOR.officialReceipt.orNumber.match(/\d+$/);
         if (match) {
            nextNumber = parseInt(match[0]) + 1;
         }
      }

      // Format: OR-YYYY-XXXXX (where XXXXX is a 5-digit number padded with zeros)
      return `OR-${currentYear}-${nextNumber.toString().padStart(5, '0')}`;
   } catch (error) {
      console.error('Error generating OR number:', error);
      throw error;
   }
};

module.exports = { generateORNumber };
