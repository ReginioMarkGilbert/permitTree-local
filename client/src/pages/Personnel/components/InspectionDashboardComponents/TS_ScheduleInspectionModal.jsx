import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CREATE_INSPECTION = gql`
  mutation CreateInspection($input: CreateInspectionInput!) {
    createInspection(input: $input) {
      id
      scheduledDate
      scheduledTime
      location
      inspectionStatus
    }
  }
`;

const TS_ScheduleInspectionModal = ({ isOpen, onClose, application, onScheduleComplete }) => {
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    location: '',
    additionalNotes: ''
  });

  const [createInspection] = useMutation(CREATE_INSPECTION);

  const handleSchedule = async () => {
    // Validate inputs
    if (!scheduleData.date || !scheduleData.time || !scheduleData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(scheduleData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Please select a future date');
      return;
    }

    try {
      const result = await createInspection({
        variables: {
          input: {
            permitId: application.id,
            scheduledDate: scheduleData.date,
            scheduledTime: scheduleData.time,
            location: scheduleData.location
          }
        }
      });

      toast.success('Inspection scheduled successfully');
      if (onScheduleComplete) {
        onScheduleComplete();
      }
      onClose();
    } catch (error) {
      toast.error(`Error scheduling inspection: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Inspection</DialogTitle>
          <DialogDescription>
            Schedule inspection for application {application?.applicationNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              value={scheduleData.date}
              onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={scheduleData.time}
              onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter inspection location"
              value={scheduleData.location}
              onChange={(e) => setScheduleData({...scheduleData, location: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or instructions..."
              value={scheduleData.additionalNotes}
              onChange={(e) => setScheduleData({...scheduleData, additionalNotes: e.target.value})}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
          >
            Schedule Inspection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TS_ScheduleInspectionModal;
