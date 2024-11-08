const Certificate = require('../models/Certificate');

const generateCertificateNumber = async (applicationType) => {
   const currentYear = new Date().getFullYear();
   let prefix;

   switch (applicationType) {
      case 'Chainsaw Registration':
         prefix = 'MR-MRQ';
         break;
      // Add other application types here
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
