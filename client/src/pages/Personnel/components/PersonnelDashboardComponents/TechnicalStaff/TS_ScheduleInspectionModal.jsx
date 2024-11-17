import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const SCHEDULE_INSPECTION = gql`
  mutation ScheduleInspection(
    $permitId: ID!
    $scheduledDate: String!
    $scheduledTime: String!
    $location: String!
  ) {
    scheduleInspection(
      permitId: $permitId
      scheduledDate: $scheduledDate
      scheduledTime: $scheduledTime
      location: $location
    ) {
      id
      currentStage
      status
      inspectionSchedule {
        scheduledDate
        scheduledTime
        location
        status
      }
    }
  }
`;

const TS_ScheduleInspectionModal = ({ isOpen, onClose, application }) => {
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    location: ''
  });

  const [scheduleInspection] = useMutation(SCHEDULE_INSPECTION);

  const handleSchedule = async () => {
    try {
      await scheduleInspection({
        variables: {
          permitId: application.id,
          scheduledDate: scheduleData.date,
          scheduledTime: scheduleData.time,
          location: scheduleData.location
        }
      });

      toast.success('Inspection scheduled successfully');
      onClose();
    } catch (error) {
      toast.error(`Error scheduling inspection: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Inspection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="date"
            value={scheduleData.date}
            onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
          />
          <Input
            type="time"
            value={scheduleData.time}
            onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
          />
          <Input
            placeholder="Location"
            value={scheduleData.location}
            onChange={(e) => setScheduleData({...scheduleData, location: e.target.value})}
          />
          <Button onClick={handleSchedule}>Schedule Inspection</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TS_ScheduleInspectionModal;
