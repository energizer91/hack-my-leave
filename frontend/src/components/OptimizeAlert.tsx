import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import dayjs from 'dayjs';
import { Switch } from '@/components/ui/switch.tsx';
import { Label } from '@/components/ui/label.tsx';

interface OptimizeAlertProps {
  show?: boolean;
  showAll?: boolean;
  onToggle: (value: boolean) => void;
}

export const OptimizeAlert = ({ show, showAll = false, onToggle }: OptimizeAlertProps) => {
  if (!show) return null;

  return (
    <Alert className="mt-9" variant="default">
      <Info />
      <div className="flex flex-col lg:flex-row justify-between gap-2">
        <div>
          <AlertTitle>Optimization starts from today, {dayjs().format('MMM D, YYYY')}</AlertTitle>
          <AlertDescription>
            The calculation begins with today’s date to help you optimize your remaining vacation
            days as effectively as possible.
          </AlertDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="skip-past">Show all</Label>
          <Switch id="skip-past" checked={showAll} onCheckedChange={onToggle} />
        </div>
      </div>
    </Alert>
  );
};
