const Counter = require('../models/Counter');

const generateApplicationNumber = async (prefix) => {
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
      console.error(`Error generating ${prefix} application number:`, error);
      throw error;
   }
};

const CSAW_ApplicationNumber = () => generateApplicationNumber('CSAW');
const COV_ApplicationNumber = () => generateApplicationNumber('COV');
const PTPR_ApplicationNumber = () => generateApplicationNumber('PTPR');
const PLTCP_ApplicationNumber = () => generateApplicationNumber('PLTCP');
const PLTP_ApplicationNumber = () => generateApplicationNumber('PLTP');
const TCEBP_ApplicationNumber = () => generateApplicationNumber('TCEBP');

module.exports = {
   CSAW_ApplicationNumber,
   COV_ApplicationNumber,
   PTPR_ApplicationNumber,
   PLTCP_ApplicationNumber,
   PLTP_ApplicationNumber,
   TCEBP_ApplicationNumber
};
