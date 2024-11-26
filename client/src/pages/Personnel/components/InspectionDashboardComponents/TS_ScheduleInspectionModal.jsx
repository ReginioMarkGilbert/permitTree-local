import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateTimePicker } from "@/components/ui/dateTimePicker";

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
  const [createInspection] = useMutation(CREATE_INSPECTION);
  const [scheduleData, setScheduleData] = useState({
    date: new Date(),
    location: "",
    additionalNotes: "",
  });

  const handleDateTimeChange = (newDate) => {
    console.log("DateTimePicker selected:", newDate);
    setScheduleData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scheduleData.date || !scheduleData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const selectedDate = new Date(scheduleData.date);

      // Format date as YYYY-MM-DD
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      // Format time as HH:mm (24-hour format)
      const formattedTime = format(selectedDate, "HH:mm");

      console.log("Selected in modal:", {
        rawDate: scheduleData.date,
        selectedDate,
        formattedDate,
        formattedTime
      });

      const input = {
        permitId: application.id,
        scheduledDate: formattedDate,
        scheduledTime: formattedTime,
        location: scheduleData.location.trim(),
      };

      const response = await createInspection({
        variables: { input },
      });

      if (response.data) {
        toast.success("Inspection scheduled successfully");
        onScheduleComplete?.();
        onClose();
      }
    } catch (error) {
      console.error("Error scheduling inspection:", error);
      toast.error("Failed to schedule inspection");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Inspection</DialogTitle>
          <DialogDescription>
            Schedule inspection for application {application?.id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date and Time</Label>
              <DateTimePicker
                date={scheduleData.date}
                setDate={handleDateTimeChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={scheduleData.location}
                onChange={(e) => setScheduleData({
                  ...scheduleData,
                  location: e.target.value
                })}
                placeholder="Enter inspection location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={scheduleData.additionalNotes}
                onChange={(e) => setScheduleData({
                  ...scheduleData,
                  additionalNotes: e.target.value
                })}
                placeholder="Any additional notes or instructions..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Schedule Inspection</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TS_ScheduleInspectionModal;
