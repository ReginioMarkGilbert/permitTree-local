const Certificate = require('../models/Certificate');
const Counter = require('../models/Counter');

const generateCertificateNumber = async (applicationType) => {
   const currentYear = new Date().getFullYear();
   let prefix;

   switch (applicationType) {
      case 'Chainsaw Registration':
         prefix = 'CSAW';
         break;
      case 'Certificate of Verification':
         prefix = 'COV';
         break;
      case 'Private Tree Plantation Registration':
         prefix = 'PTPR';
         break;
      case 'Public Land Tree Cutting Permit':
         prefix = 'PLTCP';
         break;
      case 'Private Land Timber Permit':
         prefix = 'PLTP';
         break;
      case 'Tree Cutting and/or Earth Balling Permit':
         prefix = 'TCEBP';
         break;
      default:
         prefix = 'CERT';
   }

   try {
      // Use Counter model to get next sequence
      const counter = await Counter.findOneAndUpdate(
         { _id: `${prefix}Certificate` },
         { $inc: { seq: 1 } },
         { new: true, upsert: true }
      );

      return `${prefix}-${currentYear}-${counter.seq.toString().padStart(4, '0')}`;
   } catch (error) {
      console.error('Error generating certificate number:', error);
      throw error;
   }
};

module.exports = { generateCertificateNumber };
