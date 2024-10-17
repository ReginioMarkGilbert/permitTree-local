const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

const generateCustomId = async (prefix) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: `${prefix}Id` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const id = String(counter.seq).padStart(6, '0');

    return `PMDQ-${prefix}-${year}-${month}${day}-${id}`;
  } catch (error) {
    console.error(`Error generating ${prefix} customId:`, error);
    throw error;
  }
};

const CSAW_CustomId = () => generateCustomId('CSAW');
const COV_CustomId = () => generateCustomId('COV');

module.exports = { CSAW_CustomId, COV_CustomId };
