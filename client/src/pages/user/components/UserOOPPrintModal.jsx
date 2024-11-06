import React from 'react';
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import denrLogo from "@/assets/denr-logo.png";

const UserOOPPrintModal = ({ oop, isOpen, onClose }) => {
   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const handlePrint = () => {
      window.print();
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="flex justify-between items-center no-print">
               <DialogTitle>Print Order of Payment</DialogTitle>
               <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrint}
               >
                  <Printer className="h-4 w-4" />
               </Button>
            </DialogHeader>

            <div id="printable-content" className="print-container">
               <div className="content-wrapper">
                  {/* Header */}
                  <div className="text-center mb-4">
                     <img src={denrLogo} alt="DENR Logo" className="mx-auto w-16 mb-2" />
                     <p className="text-sm">Republic of the Philippines</p>
                     <p className="text-sm">Department of Environment and Natural Resources</p>
                     <p className="text-sm">PENRO Marinduque</p>
                  </div>

                  <h1 className="text-center font-bold text-sm mb-4">Assessment of Fees and Charges</h1>

                  {/* Bill Info - Right aligned */}
                  <div className="text-right mb-4 text-sm">
                     <p>Bill No.: {oop?.billNo}</p>
                     <p>Date: {formatDate(oop?.createdAt)}</p>
                  </div>

                  {/* Form Fields */}
                  <div className="mb-4 text-sm">
                     <div className="mb-2">
                        <span>Name/Payee: </span>
                        <span>{oop?.namePayee}</span>
                     </div>
                     <div className="mb-2">
                        <span>Address: </span>
                        <span>{oop?.address}</span>
                     </div>
                     <div className="mb-2">
                        <span>Nature of Application/Permit/Documents being secured:</span>
                        <div>{oop?.natureOfApplication}</div>
                     </div>
                  </div>

                  {/* Fees Table */}
                  <table className="w-full border-collapse text-sm mb-8">
                     <thead>
                        <tr>
                           <th className="border border-black p-1 text-left w-1/4">Legal Basis (DAO/SEC)</th>
                           <th className="border border-black p-1 text-left">Description and Computation of Fees and Charges</th>
                           <th className="border border-black p-1 text-right w-1/6">Amount</th>
                        </tr>
                     </thead>
                     <tbody>
                        {oop?.items?.map((item, index) => (
                           <tr key={index}>
                              <td className="border border-black p-1">{item.legalBasis}</td>
                              <td className="border border-black p-1">{item.description}</td>
                              <td className="border border-black p-1 text-right">₱ {item.amount.toFixed(2)}</td>
                           </tr>
                        ))}
                        <tr>
                           <td colSpan="2" className="border border-black p-1 text-right font-bold">TOTAL</td>
                           <td className="border border-black p-1 text-right font-bold">
                              ₱ {oop?.items?.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                           </td>
                        </tr>
                     </tbody>
                  </table>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                     <div className="text-center">
                        <div className="h-16 flex items-end justify-center mb-1">
                           {oop?.rpsSignatureImage && (
                              <img src={oop.rpsSignatureImage} alt="RPS Signature" className="max-h-full" />
                           )}
                        </div>
                        <div className="border-t border-black pt-1">
                           <p className="text-sm font-bold">SIMEON R. DIAZ</p>
                           <p className="text-xs">SVEMS/Chief, RPS</p>
                        </div>
                     </div>
                     <div className="text-center">
                        <div className="h-16 flex items-end justify-center mb-1">
                           {oop?.tsdSignatureImage && (
                              <img src={oop.tsdSignatureImage} alt="TSD Signature" className="max-h-full" />
                           )}
                        </div>
                        <div className="border-t border-black pt-1">
                           <p className="text-sm font-bold">Engr. CYNTHIA U. LOZANO</p>
                           <p className="text-xs">Chief, Technical Services Division</p>
                        </div>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                        <p>Received: _____________</p>
                        <p>Date: _____________</p>
                        <p>Released Date: _____________</p>
                     </div>
                     <div>
                        <p>Tracking No.: _____________</p>
                        <p>Time: _____________</p>
                        <p>Time: _____________</p>
                     </div>
                  </div>
               </div>
            </div>

            <style jsx>{`
               @media print {
                  @page {
                     size: letter portrait;
                     margin: 0.5in;
                  }

                  /* Hide everything except printable content */
                  body > *:not(#printable-content) {
                     display: none !important;
                  }

                  /* Reset any fixed positioning */
                  #printable-content {
                     position: absolute;
                     top: 0;
                     left: 0;
                     margin: 0;
                     padding: 0.5in;
                     width: 100%;
                     background: white;
                  }

                  /* Hide dialog elements */
                  .no-print,
                  [role="dialog"] {
                     display: none !important;
                  }

                  /* Content styling */
                  .content-wrapper {
                     width: 100%;
                     margin: 0;
                     padding: 0;
                     font-size: 12pt;
                  }

                  /* Logo sizing */
                  img.logo {
                     width: 60px;
                     height: auto;
                  }

                  /* Table styling */
                  table {
                     width: 100%;
                     border-collapse: collapse;
                     page-break-inside: avoid;
                  }

                  th, td {
                     border: 1px solid black;
                  }

                  /* Ensure signatures stay together */
                  .signatures-section {
                     page-break-inside: avoid;
                     margin-top: 2em;
                  }

                  /* Remove any background colors */
                  * {
                     -webkit-print-color-adjust: exact;
                     print-color-adjust: exact;
                     color-adjust: exact;
                     background: transparent;
                  }

                  /* Hide scrollbars */
                  ::-webkit-scrollbar {
                     display: none;
                  }
               }
            `}</style>
         </DialogContent>
      </Dialog>
   );
};

export default UserOOPPrintModal;
