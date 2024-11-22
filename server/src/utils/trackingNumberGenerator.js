const Counter = require('../models/Counter');

async function generateTrackingNumber() {
   try {
      const date = new Date();
      const year = date.getFullYear();

      // Find and update counter for the year
      const counter = await Counter.findOneAndUpdate(
         { _id: `trackingNo_${year}` },
         { $inc: { seq: 1 } },
         { new: true, upsert: true }
      );

      // Format: TR-YYYY-XXXXX where XXXXX is a continuous sequence for the year
      const sequenceStr = counter.seq.toString().padStart(5, '0');
      return `TR-${year}-${sequenceStr}`;
   } catch (error) {
      console.error('Error generating tracking number:', error);
      throw error;
   }
}

module.exports = { generateTrackingNumber };
