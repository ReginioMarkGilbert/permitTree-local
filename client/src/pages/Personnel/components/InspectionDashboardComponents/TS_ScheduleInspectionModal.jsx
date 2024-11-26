import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Create a ref for the hidden date input
  const dateInputRef = React.useRef(null);

  // Browser detection
  const isChrome = useMemo(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('chrome') && !userAgent.includes('edg') && !userAgent.includes('br');
  }, []);

  const handleDateInput = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 8) value = value.slice(0, 8);

    // Auto format as mm/dd/yyyy
    if (value.length >= 4) {
      const month = value.slice(0, 2);
      const day = value.slice(2, 4);
      const year = value.slice(4);
      value = `${month}/${day}/${year}`;
    } else if (value.length >= 2) {
      const month = value.slice(0, 2);
      const day = value.slice(2);
      value = `${month}/${day}`;
    }

    setScheduleData({...scheduleData, date: value});
  };

  const [createInspection] = useMutation(CREATE_INSPECTION);

  const handleSchedule = async () => {
    // Validate inputs
    if (!scheduleData.date || !scheduleData.time || !scheduleData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Parse and validate the date
    const [month, day, year] = scheduleData.date.split('/').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today || !selectedDate.getTime()) {
      toast.error('Please enter a valid future date');
      return;
    }

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const result = await createInspection({
        variables: {
          input: {
            permitId: application.id,
            scheduledDate: formattedDate,
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
            <div className="relative">
              <Input
                id="date"
                placeholder="mm/dd/yyyy"
                value={scheduleData.date}
                onChange={handleDateInput}
                className="pr-10"
                required
                type="text"
              />
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-muted rounded-tr-md rounded-br-md transition-colors duration-200"
                  >
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={scheduleData.date ? new Date(scheduleData.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setScheduleData({
                          ...scheduleData,
                          date: format(date, 'MM/dd/yyyy')
                        });
                        setIsCalendarOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <div className="relative">
              <Input
                id="time"
                type="text"
                inputMode="numeric"
                placeholder="HH:mm"
                value={scheduleData.time}
                onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                required
                className="pr-10"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
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
