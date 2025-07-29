import { Skeleton } from '@/components/ui/skeleton';

interface WelcomePlaceholderProps {
  isLoading?: boolean;
}

export const CalendarPlaceholder = ({ isLoading = false }: WelcomePlaceholderProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 text-center">
        <Skeleton className="h-8 w-80 mx-auto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-3 text-center">
      <h3 className="font-semibold text-2xl">Select a country to discover its annual holidays!</h3>
    </div>
  );
};
