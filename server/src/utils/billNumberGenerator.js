const mongoose = require('mongoose');

async function generateBillNo() {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Use mongoose model directly
  const OOP = mongoose.model('OOP');

  // Find the latest bill number for today with regex that matches the date part exactly
  const latestOOP = await OOP.findOne({
    billNo: new RegExp(`^${dateString}-\\d{3}$`) // Ensure exact match for date and 3 digits
  }).sort({ billNo: -1 });

  let sequence = 1;
  if (latestOOP) {
    // Extract the sequence number from the end of the bill number
    const match = latestOOP.billNo.match(/-(\d{3})$/);
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  // Format sequence to 3 digits
  const sequenceStr = sequence.toString().padStart(3, '0');
  return `${dateString}-${sequenceStr}`;
}

module.exports = { generateBillNo };
