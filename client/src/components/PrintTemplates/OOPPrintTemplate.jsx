import React from 'react';
import { format } from 'date-fns';
import './printStyles.css';

const OOPPrintTemplate = React.forwardRef((props, ref) => {
   const { oop } = props;

   // correct way of  formatting OOP date
   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   return (
      <div ref={ref} className="print-container">
         <div className="header">
            <div className="logo-section">
               <img src="/denr-logo.png" alt="DENR Logo" className="logo" />
            </div>
            <div className="header-text">
               <p>Republic of the Philippines</p>
               <p>Department of Environment and Natural Resources</p>
               <p>PENRO Marinduque</p>
            </div>
         </div>

         <h1 className="title">Assessment of Fees and Charges</h1>

         <div className="top-info">
            <div className="right-info">
               <p>Bill No.: {oop.billNo}</p>
               <p>Date: {formatDate(oop.createdAt)}</p>
            </div>
         </div>

         <div className="main-info">
            <div className="info-row">
               <p className="label">Name/Payee:</p>
               <p className="value">{oop.namePayee}</p>
            </div>
            <div className="info-row">
               <p className="label">Address:</p>
               <p className="value">{oop.address}</p>
            </div>
            <div className="info-row">
               <p className="label">Nature of Application/Permit/Documents being secured:</p>
               <p className="value">{oop.natureOfApplication}</p>
            </div>
         </div>

         <table className="fees-table">
            <thead>
               <tr>
                  <th>Legal Basis (DAO/SEC)</th>
                  <th>Description and Computation of Fees and Charges</th>
                  <th>Amount</th>
               </tr>
            </thead>
            <tbody>
               {oop.items.map((item, index) => (
                  <tr key={index}>
                     <td>{item.legalBasis}</td>
                     <td>{item.description}</td>
                     <td className="amount">₱ {item.amount.toFixed(2)}</td>
                  </tr>
               ))}
               <tr className="total-row">
                  <td colSpan="2" className="total-label">TOTAL</td>
                  <td className="total-amount">₱ {oop.totalAmount.toFixed(2)}</td>
               </tr>
            </tbody>
         </table>

         <div className="footer">
            <div className="signature-section">
               <div className="signature-box">
                  <div className="signature-line">
                     {oop.rpsSignatureImage && (
                        <img src={oop.rpsSignatureImage} alt="RPS Signature" className="signature-image" />
                     )}
                  </div>
                  <p className="signatory-name">SIMEON R. DIAZ</p>
                  <p className="signatory-title">SVEMS/Chief, RPS</p>
               </div>
               <div className="signature-box">
                  <div className="signature-line">
                     {oop.tsdSignatureImage && (
                        <img src={oop.tsdSignatureImage} alt="TSD Signature" className="signature-image" />
                     )}
                  </div>
                  <p className="signatory-name">Engr. CYNTHIA U. LOZANO</p>
                  <p className="signatory-title">Chief, Technical Services Division</p>
               </div>
            </div>

            <div className="tracking-info">
               <div className="tracking-row">
                  <span>Received: _____________</span>
                  <span>Tracking No.: _____________</span>
               </div>
               <div className="tracking-row">
                  <span>Date: _____________</span>
                  <span>Time: _____________</span>
               </div>
               <div className="tracking-row">
                  <span>Released Date: _____________</span>
                  <span>Time: _____________</span>
               </div>
            </div>
         </div>
      </div>
   );
});

OOPPrintTemplate.displayName = 'OOPPrintTemplate';

export default OOPPrintTemplate;
