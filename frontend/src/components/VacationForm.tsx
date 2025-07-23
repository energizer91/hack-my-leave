import type { VacationFormData } from '../types/vacations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
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
import { useStrategies } from '@/hooks/useStrategies.ts';
import { useEffect } from 'react';

interface VacationFormProps {
  onSubmit: (data: VacationFormData) => void;
}

const values = Array.from({ length: 3 }, (_, i) => 2024 + i);

export const VacationForm = ({ onSubmit }: VacationFormProps) => {
  const { data } = useStrategies();
  const formSchema = z.object({
    availableDays: z.number().min(1).max(365),
    year: z.number().min(2024).max(2026),
    country: z.string().min(2).max(3),
    strategy: z.enum((data ?? []).map(({ value }) => value)),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { availableDays: 24, year: dayjs().year(), country: 'SE' },
  });

  useEffect(() => {
    data && form.setValue('strategy', data[0].value);
  }, [data, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vacation Details</CardTitle>
      </CardHeader>
      <CardContent>
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
            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Strategy</FormLabel>
                  <Select {...field} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select vacation strategy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(data ?? []).map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Optimize Vacation</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
