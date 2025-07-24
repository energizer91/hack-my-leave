import { useState, useMemo, useEffect } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCountries } from '@/hooks/useCountries.ts';
import { toast } from 'sonner';

interface CountrySelectorProps {
  country?: string;
  onChange: (country: string) => void;
}

export const CountrySelect = ({ country, onChange }: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);
  const { isLoading, data = {}, error } = useCountries();

  useEffect(() => {
    error &&
      toast.error('Something went wrong!', {
        description: error.message,
        duration: 5000,
      });
  }, [error]);

  const countries = useMemo(
    () => Object.entries(data).map(([k, v]) => ({ value: k, label: v })),
    [data],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size="lg"
          aria-expanded={open}
          disabled={isLoading}
          className="justify-between text-xl"
        >
          {country
            ? countries.find((framework) => framework.value === country)?.label
            : 'Country...'}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." disabled={isLoading} />
          <CommandList>
            <CommandEmpty>No countries found.</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.value}
                  value={c.label}
                  onSelect={() => {
                    onChange(c.value === country ? '' : c.value);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      country === c.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
