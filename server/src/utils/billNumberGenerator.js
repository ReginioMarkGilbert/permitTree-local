const mongoose = require('mongoose');

async function generateBillNo() {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Use mongoose model directly
  const OOP = mongoose.model('OOP');

  // Find the latest bill number for today
  const latestOOP = await OOP.findOne({
    billNo: new RegExp(`^${dateString}`)
  }).sort({ billNo: -1 });

  let sequence = 1;
  if (latestOOP) {
    const lastSequence = parseInt(latestOOP.billNo.split('-')[1]);
    sequence = lastSequence + 1;
  }

  // Format sequence to 3 digits
  const sequenceStr = sequence.toString().padStart(3, '0');
  return `${dateString}-${sequenceStr}`;
}

module.exports = { generateBillNo };