import React, { useState } from 'react';
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
      status
      findings {
        result
        observations
        recommendations
        photos {
          url
          caption
        }
        attachments {
          url
          type
          description
        }
      }
    }
  }
`;

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage($id: ID!, $currentStage: String!, $status: String!, $notes: String) {
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
    photos: [],
    attachments: []
  });

  const [recordInspectionFindings] = useMutation(RECORD_INSPECTION_FINDINGS);
  const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'photos') {
      setFindings(prev => ({
        ...prev,
        photos: [...prev.photos, ...files]
      }));
    } else {
      setFindings(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (type, fileToRemove) => {
    if (type === 'photos') {
      setFindings(prev => ({
        ...prev,
        photos: prev.photos.filter(file => file !== fileToRemove)
      }));
    } else {
      setFindings(prev => ({
        ...prev,
        attachments: prev.attachments.filter(file => file !== fileToRemove)
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!findings.result) {
        toast.error('Please select an inspection result');
        return;
      }

      // Process files
      const processedPhotos = await Promise.all(findings.photos.map(async file => {
        const content = await readFileAsBase64(file);
        return {
          url: content,
          caption: file.name,
          timestamp: new Date().toISOString()
        };
      }));

      const processedAttachments = await Promise.all(findings.attachments.map(async file => {
        const content = await readFileAsBase64(file);
        return {
          url: content,
          type: file.type,
          description: file.name
        };
      }));

      // Record inspection findings
      await recordInspectionFindings({
        variables: {
          id: inspection.id,
          findings: {
            result: findings.result,
            observations: findings.observations || 'No observations recorded',
            recommendations: findings.recommendations || 'No recommendations provided',
            photos: processedPhotos,
            attachments: processedAttachments
          }
        }
      });

      // Update permit stage
      await updatePermitStage({
        variables: {
          id: application.id,
          currentStage: 'ChiefRPSReview',
          status: 'In Progress',
          notes: 'Inspection completed and forwarded for review'
        }
      });

      toast.success('Inspection report submitted and forwarded to Chief RPS');
      onComplete();
      onClose();
    } catch (error) {
      toast.error(`Error submitting inspection report: ${error.message}`);
    }
  };

  // Helper function to read file as base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Inspection Report</DialogTitle>
          <DialogDescription>
            Record inspection findings and submit report for {application?.applicationNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Inspection Result <span className="text-red-500">*</span></Label>
            <Select
              value={findings.result}
              onValueChange={(value) => setFindings({...findings, result: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
                <SelectItem value="Needs Modification">Needs Modification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observations</Label>
            <Textarea
              value={findings.observations}
              onChange={(e) => setFindings({...findings, observations: e.target.value})}
              placeholder="Enter detailed observations (optional)..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Recommendations</Label>
            <Textarea
              value={findings.recommendations}
              onChange={(e) => setFindings({...findings, recommendations: e.target.value})}
              placeholder="Enter recommendations (optional)..."
              rows={3}
            />
          </div>

          <UploadCard
            label="Inspection Photos"
            documentLabel="Upload inspection photos"
            files={findings.photos}
            onFileChange={(e) => handleFileChange(e, 'photos')}
            onRemoveFile={(file) => removeFile('photos', file)}
            accept="image/*"
          />

          <UploadCard
            label="Supporting Documents"
            documentLabel="Upload supporting documents"
            files={findings.attachments}
            onFileChange={(e) => handleFileChange(e, 'attachments')}
            onRemoveFile={(file) => removeFile('attachments', file)}
            accept=".pdf,.doc,.docx"
          />
        </div>

        <div className="flex justify-end space-x-2">
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
