const Certificate = require('../models/Certificate');
const Permit = require('../models/permits/Permit');
const cron = require('node-cron');

const checkExpiredCertificates = async () => {
   try {
      // Find certificates with expired dates
      const expiredByDate = await Certificate.find({
         certificateStatus: { $ne: 'Expired' },
         expiryDate: { $lt: new Date() }
      });

      // Find certificates with expired permits
      const expiredByPermit = await Certificate.find({
         certificateStatus: { $ne: 'Expired' },
         applicationId: {
            $in: await Permit.find({
               status: 'Expired',
               currentStage: 'ForRenewal'
            }).distinct('_id')
         }
      });

      const allExpired = [...expiredByDate, ...expiredByPermit];
      console.log('Found expired certificates:', allExpired.length);

      for (const certificate of allExpired) {
         certificate.certificateStatus = 'Expired';
         await certificate.save();

         console.log('Updated certificate status:', {
            certificateNumber: certificate.certificateNumber,
            newStatus: certificate.certificateStatus
         });

         // Ensure permit is also marked as expired
         const updatedPermit = await Permit.findByIdAndUpdate(
            certificate.applicationId,
            {
               $set: {
                  status: 'Expired',
                  currentStage: 'ForRenewal'
               }
            },
            { new: true }
         );

         console.log('Synced permit status:', {
            applicationNumber: updatedPermit.applicationNumber,
            status: updatedPermit.status,
            stage: updatedPermit.currentStage
         });
      }
   } catch (error) {
      console.error('Error checking expired certificates:', error);
   }
};

// Run every 5 seconds
const scheduleCertificateExpirationCheck = () => {
   // cron.schedule('0 0 * * *', checkExpiredCertificates); // 1 day
   cron.schedule('*/5 * * * * *', checkExpiredCertificates); // 5 seconds
   // 30 seconds
   // cron.schedule('*/30 * * * * *', checkExpiredCertificates); // 30 seconds
   // 5 minutes
   // cron.schedule('*/30 * * * *', checkExpiredCertificates); // 30 minutes
   // 1 hour
   // cron.schedule('0 */1 * * *', checkExpiredCertificates); // 1 hour
};

module.exports = {
   checkExpiredCertificates,
   scheduleCertificateExpirationCheck
};
