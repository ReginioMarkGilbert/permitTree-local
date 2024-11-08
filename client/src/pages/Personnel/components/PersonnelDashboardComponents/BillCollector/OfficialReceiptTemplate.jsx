import React from 'react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';

const OfficialReceiptTemplate = React.forwardRef(({ oop, orDetails }, ref) => {
   const formatDate = (date) => {
      return format(new Date(date), 'MMMM d, yyyy');
   };

   return (
      <div ref={ref} className="w-[8.5in] h-[11in] p-8 bg-white mx-auto">
         {/* Header */}
         <div className="text-center mb-6">
            <h1 className="text-xl font-bold">Republic of the Philippines</h1>
            <h2 className="text-lg font-bold">Department of Environment and Natural Resources</h2>
            <h3 className="font-bold">PENRO Marinduque</h3>
            <h4 className="text-lg font-bold mt-4">OFFICIAL RECEIPT</h4>
         </div>

         {/* Receipt Details */}
         <div className="border-2 border-black p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <p><span className="font-bold">OR No:</span> {orDetails.orNumber}</p>
                  <p><span className="font-bold">Date:</span> {formatDate(orDetails.dateIssued)}</p>
               </div>
               <div className="text-right">
                  <p><span className="font-bold">Bill No:</span> {oop.billNo}</p>
                  <p><span className="font-bold">Application No:</span> {oop.applicationId}</p>
               </div>
            </div>

            <div className="mb-4">
               <p><span className="font-bold">Received from:</span> {oop.namePayee}</p>
               <p><span className="font-bold">Address:</span> {oop.address}</p>
            </div>

            {/* Payment Details Table */}
            <table className="w-full mb-4 border-collapse">
               <thead>
                  <tr className="border border-black">
                     <th className="border border-black p-2">Description</th>
                     <th className="border border-black p-2 w-32">Amount</th>
                  </tr>
               </thead>
               <tbody>
                  {oop.items.map((item, index) => (
                     <tr key={index} className="border border-black">
                        <td className="border border-black p-2">{item.description}</td>
                        <td className="border border-black p-2 text-right">₱{item.amount.toFixed(2)}</td>
                     </tr>
                  ))}
                  <tr className="border border-black font-bold">
                     <td className="border border-black p-2 text-right">Total Amount:</td>
                     <td className="border border-black p-2 text-right">₱{oop.totalAmount.toFixed(2)}</td>
                  </tr>
               </tbody>
            </table>

            <div className="mb-4">
               <p><span className="font-bold">Payment Method:</span> {orDetails.paymentMethod}</p>
               {orDetails.remarks && (
                  <p><span className="font-bold">Remarks:</span> {orDetails.remarks}</p>
               )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="text-center">
                  <div className="border-t border-black pt-2">
                     <p className="font-bold">Issued by</p>
                     <p>Bill Collector</p>
                  </div>
               </div>
               <div className="text-center">
                  <div className="border-t border-black pt-2">
                     <p className="font-bold">Received by</p>
                     <p>Applicant</p>
                  </div>
               </div>
            </div>

            {/* QR Code */}
            <div className="absolute bottom-8 right-8">
               <QRCode
                  value={`${orDetails.orNumber}-${oop.billNo}`}
                  size={80}
               />
            </div>
         </div>

         {/* Footer */}
         <div className="text-center mt-4 text-sm">
            <p>This is a system-generated official receipt.</p>
            <p>Keep this receipt for your records.</p>
         </div>
      </div>
   );
});

OfficialReceiptTemplate.displayName = 'OfficialReceiptTemplate';

export default OfficialReceiptTemplate;
