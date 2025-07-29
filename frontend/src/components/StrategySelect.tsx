import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { useStrategies } from '@/hooks/useStrategies.ts';
import type { Control, UseFormSetValue } from 'react-hook-form';
import type { VacationFormData } from '@/types/vacations.ts';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface StrategySelectProps {
  isLoading?: boolean;
  control: Control<VacationFormData, unknown, VacationFormData>;
  setValue: UseFormSetValue<VacationFormData>;
}

export const StrategySelect = ({ isLoading, control, setValue }: StrategySelectProps) => {
  const { error, data = [], isLoading: isStrategiesLoading } = useStrategies();

  useEffect(() => {
    data.length && setValue('strategy', data[0].value);
  }, [data, setValue]);

  useEffect(() => {
    error &&
      toast.error('Something went wrong!', {
        description: error.message,
        duration: 5000,
      });
  }, [error]);

  return (
    <FormField
      control={control}
      name="strategy"
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>Strategy</FormLabel>
          <Select
            disabled={isLoading || isStrategiesLoading}
            value={field.value || ''}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select vacation strategy" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {data.map(({ label, value, tooltip }) => (
                <SelectItem key={value} value={value} tooltip={tooltip}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
