import type { VacationFormData } from '../types/vacations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { Button } from '@/components/ui/button.tsx';
import { StrategySelect } from '@/components/StrategySelect.tsx';

interface VacationFormProps {
  onSubmit: (data: VacationFormData) => void;
  isLoading?: boolean;
}

const currentYear = dayjs().year();
const values = Array.from({ length: 3 }, (_, i) => currentYear + i);
const formSchema = z.object({
  availableDays: z.number().min(1).max(365),
  year: z
    .number()
    .min(values[0])
    .max(values[values.length - 1]),
  strategy: z.string().min(1),
});

export const VacationForm = ({ onSubmit, isLoading = false }: VacationFormProps) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { availableDays: 24, year: dayjs().year(), strategy: '' },
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="availableDays"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Available days</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    type="number"
                    placeholder="24"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Year</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={(e) => field.onChange(parseInt(e, 10))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {values.map((v) => (
                      <SelectItem key={v} value={v.toString()}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <StrategySelect control={form.control} setValue={form.setValue} isLoading={isLoading} />
        <Button disabled={isLoading} type="submit">
          Optimize Vacation
        </Button>
      </form>
    </Form>
  );
};
