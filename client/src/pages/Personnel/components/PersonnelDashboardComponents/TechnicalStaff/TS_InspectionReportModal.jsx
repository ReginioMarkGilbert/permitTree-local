import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { UploadCard } from '../../../../user/ApplicationForms/CSAWForm/CSAWFormUtils';

const RECORD_INSPECTION_FINDINGS = gql`
  mutation RecordInspectionFindings($id: ID!, $findings: InspectionFindingsInput!) {
    recordInspectionFindings(id: $id, findings: $findings) {
      id
      inspectionStatus
      findings {
        result
        observations
        recommendations
        attachments {
          filename
          contentType
          data
        }
      }
    }
  }
`;

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes
    ) {
      id
      currentStage
      status
    }
  }
`;

const TS_InspectionReportModal = ({ isOpen, onClose, inspection, application, onComplete }) => {
   const [findings, setFindings] = useState({
      result: '',
      observations: '',
      recommendations: '',
      attachments: []
   });

   const [recordInspectionFindings] = useMutation(RECORD_INSPECTION_FINDINGS);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

   // Chrome detection for select input
   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
         };
         reader.onerror = (error) => reject(error);
         reader.readAsDataURL(file);
      });
   };

   const resultOptions = [
      { value: "Pass", label: "Pass" },
      { value: "Fail", label: "Fail" },
      { value: "Needs Modification", label: "Needs Modification" }
   ];

   const handleFileChange = (e) => {
      if (e.target.files) {
         const newFiles = Array.from(e.target.files);
         setFindings(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newFiles]
         }));
      }
   };

   const removeFile = (fileToRemove) => {
      setFindings(prev => ({
         ...prev,
         attachments: prev.attachments.filter(file => file !== fileToRemove)
      }));
   };

   const handleSubmit = async () => {
      try {
         if (!findings.result) {
            toast.error('Please select an inspection result');
            return;
         }

         if (!inspection?.id) {
            throw new Error('Inspection ID is required');
         }

         if (!application?.id) {
            throw new Error('Application ID is required');
         }

         // Process files
         const processedFiles = await Promise.all(findings.attachments.map(async (file) => {
            const base64Content = await readFileAsBase64(file);
            return {
               filename: file.name,
               contentType: file.type,
               data: base64Content
            };
         }));

         // Record inspection findings
         const { data: inspectionData } = await recordInspectionFindings({
            variables: {
               id: inspection.id,
               findings: {
                  result: findings.result,
                  observations: findings.observations || '',
                  recommendations: findings.recommendations || '',
                  attachments: processedFiles
               }
            }
         });

         // Update permit stage
         await updatePermitStage({
            variables: {
               id: application.id,
               currentStage: 'InspectionReportForReviewByChief',
               status: 'In Progress',
               notes: `Inspection completed with result: ${findings.result}`
            }
         });

         toast.success('Inspection report submitted and forwarded to Chief RPS');
         onComplete();
         onClose();
      } catch (error) {
         console.error('Error submitting inspection report:', error);
         toast.error(`Error submitting report: ${error.message}`);
      }
   };

   // Result Select Component
   const ResultSelectComponent = () => {
      if (isChrome) {
         return (
            <select
               value={findings.result}
               onChange={(e) => setFindings({ ...findings, result: e.target.value })}
               className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
               <option value="" disabled>Select result</option>
               {resultOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                     {option.label}
                  </option>
               ))}
            </select>
         );
      }

      return (
         <Select
            value={findings.result}
            onValueChange={(value) => setFindings({ ...findings, result: value })}
         >
            <SelectTrigger>
               <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent>
               {resultOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                     {option.label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      );
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Submit Inspection Report</DialogTitle>
               <DialogDescription>
                  Record inspection findings and submit report for {application?.applicationNumber}
               </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2">
               <div className="space-y-6 py-4">
                  <div className="space-y-2">
                     <Label>Inspection Result <span className="text-red-500">*</span></Label>
                     <ResultSelectComponent />
                  </div>

                  <div className="space-y-2">
                     <Label>Observations</Label>
                     <Textarea
                        value={findings.observations}
                        onChange={(e) => setFindings({ ...findings, observations: e.target.value })}
                        placeholder="Enter detailed observations (optional)..."
                        rows={4}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label>Recommendations</Label>
                     <Textarea
                        value={findings.recommendations}
                        onChange={(e) => setFindings({ ...findings, recommendations: e.target.value })}
                        placeholder="Enter recommendations (optional)..."
                        rows={3}
                     />
                  </div>

                  <UploadCard
                     label="Supporting Documents & Photos"
                     documentLabel="Upload inspection photos and documents (PDF, DOC, XLS)"
                     files={findings.attachments}
                     onFileChange={handleFileChange}
                     onRemoveFile={removeFile}
                     accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                  />
               </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
               <Button variant="outline" onClick={onClose}>
                  Cancel
               </Button>
               <Button
                  onClick={handleSubmit}
                  disabled={!findings.result}
               >
                  Submit Report & Forward to Chief RPS
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default TS_InspectionReportModal;
