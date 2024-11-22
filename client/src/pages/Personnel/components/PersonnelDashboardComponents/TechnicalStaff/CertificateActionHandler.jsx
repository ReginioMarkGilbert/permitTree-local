import React from 'react';
import GenerateCSAWCertificateModal from './GenerateCSAWCertificateModal';
import UploadCertificateModal from './UploadCertificateModal';

const CertificateActionHandler = ({ isOpen, onClose, application, onComplete }) => {
   const isChainsaw = application?.applicationType === 'Chainsaw Registration';

   if (isChainsaw) {
      return (
         <GenerateCSAWCertificateModal
            isOpen={isOpen}
            onClose={onClose}
            application={application}
            onComplete={onComplete}
         />
      );
   }

   return (
      <UploadCertificateModal
         isOpen={isOpen}
         onClose={onClose}
         application={application}
         onComplete={onComplete}
      />
   );
};

export default CertificateActionHandler;
