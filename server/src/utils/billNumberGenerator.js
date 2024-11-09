const Counter = require('../models/Counter');

async function generateBillNo() {
   try {
      const date = new Date();
      const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');

      // Find and update counter for specific date
      const counter = await Counter.findOneAndUpdate(
         { _id: `billNo_${dateString}` },  // Counter specific to this date
         { $inc: { seq: 1 } },
         { new: true, upsert: true }
      );

      // Format: YYYYMMDD-XXX where XXX resets daily
      const sequenceStr = counter.seq.toString().padStart(3, '0');
      return `${dateString}-${sequenceStr}`;
   } catch (error) {
      console.error('Error generating bill number:', error);
      throw error;
   }
}

module.exports = { generateBillNo };
