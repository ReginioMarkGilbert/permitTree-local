const Certificate = require('../models/Certificate');

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

   // Find the latest certificate number for this type and year
   const latestCert = await Certificate.findOne({
      certificateNumber: new RegExp(`^${prefix}-${currentYear}-`),
      applicationType
   }).sort({ certificateNumber: -1 });

   let sequence = 1;
   if (latestCert) {
      const match = latestCert.certificateNumber.match(/\d+$/);
      if (match) {
         sequence = parseInt(match[0]) + 1;
      }
   }

   return `${prefix}-${currentYear}-${sequence.toString().padStart(4, '0')}`;
};

module.exports = { generateCertificateNumber };
