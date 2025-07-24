import { Skeleton } from '@/components/ui/skeleton';

interface WelcomePlaceholderProps {
  isLoading?: boolean;
}

export const WelcomePlaceholder = ({ isLoading = false }: WelcomePlaceholderProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 text-center">
        <Skeleton className="h-8 w-80 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-3 text-center">
      <h3 className="font-semibold text-2xl">Let's plan your next getaway!</h3>
      <p>Just enter how many days you have&nbsp;—&nbsp;we'll do the rest.</p>
    </div>
  );
};
