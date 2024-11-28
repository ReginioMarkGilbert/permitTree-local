import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from 'sonner';
import { getUserRoles } from '@/utils/auth';
import CSAWCertificateTemplate from './certificateTemplates/CSAWCertificateTemplate';

const CSAWCertificatePrintPage = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { certificate, application } = location.state || {};

   useEffect(() => {
      if (!certificate || !application) {
         navigate('/personnel/technical-staff');
         return;
      }
   }, [certificate, application, navigate]);

   let check = 0;
   useEffect(() => {
      check++;
      if (location.pathname === '/personnel/csaw-certificate-print') {
         if (check === 1) {
            toast.info('Please wait while we print your certificate...', { duration: 3000, position: 'top-center' });
         }
         if (check === 1) {
            setTimeout(() => {
               window.print();
            }, 4500);
         }
      } else {
         toast.error('Invalid URL');
         navigate('/personnel/technical-staff'); // Redirect to Technical Staff Dashboard
      }
   }, [location.pathname]);

   const handleBack = () => {
      const userRoles = getUserRoles();
      if (userRoles.includes('Technical_Staff')) {
         navigate("/personnel/technical-staff");
      } else {
         navigate("/personnel/dashboard");
      }
   };

   if (!certificate || !application) return null;

   return (
      <div className="print-page bg-white min-h-screen">
         {/* Back Button - will be hidden during print */}
         <div className="fixed top-4 left-4 no-print">
            <Button
               variant="outline"
               onClick={handleBack}
               className="flex items-center gap-2"
            >
               <ArrowLeft className="h-4 w-4" />
               Back
            </Button>
         </div>

         <div className="print-content max-w-4xl mx-auto p-8">
            <CSAWCertificateTemplate
               certificate={certificate}
               application={application}
               hiddenOnPrint={['qr-code']}
            />
         </div>

         <style>{`
            @media print {
               @page {
                  size: letter;
                  margin: 0.5in;
               }

               body {
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
               }

               .print-page {
                  width: 100%;
                  height: 100%;
                  position: fixed;
                  top: 0;
                  left: 0;
                  margin: 0;
                  padding: 0;
                  background: white;
               }

               .print-content {
                  padding: 0;
                  max-width: none;
                  margin: 0;
               }

               .no-print, .qr-code {
                  display: none !important;
               }

               * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
               }
            }
         `}</style>
      </div>
   );
};

export default CSAWCertificatePrintPage;
