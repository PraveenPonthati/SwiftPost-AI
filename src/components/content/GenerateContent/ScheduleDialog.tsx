
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  time: string;
  onTimeChange: (time: string) => void;
  onSchedule: () => void;
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  open,
  onOpenChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  onSchedule
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>
            Choose when to publish your content
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <Label>Date</Label>
            <div className="mt-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateChange}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSchedule}>
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
