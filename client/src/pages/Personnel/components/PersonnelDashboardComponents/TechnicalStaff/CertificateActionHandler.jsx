import React from 'react';
import UploadCertificateModal from './UploadCertificateModal';

const CertificateActionHandler = ({ isOpen, onClose, application, onComplete }) => {
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
