import React from 'react';
import './Csaw_certificate.css';

const CsawCertificate = ({ data }) => {
  return (
    <div className="certificate">
      <div className="header">
        <img src="/path-to-logo.png" alt="DENR Logo" className="logo" />
        <div className="header-text">
          <h3>Republic of the Philippines</h3>
          <h3>Department of Environment and Natural Resources</h3>
          <h3>PENRO Marinduque</h3>
        </div>
      </div>
      
      <h1 className="title">CERTIFICATE OF REGISTRATION</h1>
      
      <p className="certificate-number">No. {data.certificateNumber} (RENEWAL)</p>
      
      <p className="preamble">
        After having complied with the provisions of DENR Administrative Order No. 2003 – 24,
        Series of 2003 otherwise known as "The Implementing Rules and Regulations of the
        Chainsaw Act of 2002 (RA No. 9175)" entitled "AN ACT REGULATING THE
        OWNERSHIP, POSSESION, SALE, IMPORTATION AND USE OF CHAINSAWS
        PENALIZING VIOLATIONS THEREOF AND FOR OTHER PURPOSES" this Certificate
        of Registration to own, possess and / or use a chainsaw is hereby issued to:
      </p>
      
      <h2 className="owner-name">{data.ownerName}</h2>
      <p className="owner-label">(Name of Owner)</p>
      
      <p className="address">{data.address}</p>
      <p className="address-label">(Address)</p>
      
      <p className="info-label">Bearing the following information and descriptions:</p>
      
      <div className="chainsaw-info">
        <p><strong>Use of the Chainsaw:</strong> {data.useOfChainsaw}</p>
        <p><strong>Brand:</strong> {data.brand}</p>
        <p><strong>Model:</strong> {data.model}</p>
        <p><strong>Serial No.:</strong> {data.serialNo}</p>
        <p><strong>Date of Acquisition:</strong> {data.dateOfAcquisition}</p>
        <p><strong>Power Output (kW/bhp):</strong> {data.powerOutput}</p>
        <p><strong>Maximum Length of Guidebar:</strong> {data.maxLengthGuidebar}</p>
        <p><strong>Country of Origin:</strong> {data.countryOfOrigin}</p>
        <p><strong>Purchase Price:</strong> {data.purchasePrice}</p>
        <p><strong>Others:</strong> {data.others}</p>
      </div>
      
      <div className="dates">
        <p><strong>Issued on:</strong> {data.issuedOn}</p>
        <p><strong>Expiry Date:</strong> {data.expiryDate}</p>
      </div>
      
      <p className="note">An authenticated copy of this Certification must accompany the chainsaw at all times.</p>
      
      <div className="approval">
        <p>APPROVED BY:</p>
        <div className="signature-line"></div>
        <p className="approver-name">{data.approverName}</p>
        <p className="approver-position">{data.approverPosition}</p>
      </div>
    </div>
  );
};

export default CsawCertificate;

