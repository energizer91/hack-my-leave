import { Card, CardContent } from '@/components/ui/card.tsx';
import { VacationForm } from '@/components/VacationForm.tsx';
import { VacationSummary } from '@/components/VacationSummary.tsx';
import type { VacationFormData, VacationResult } from '@/types/vacations.ts';
import { WelcomePlaceholder } from '@/components/WelcomePlaceholder.tsx';

interface WelcomeBlockProps {
  ready?: boolean;
  isLoading?: boolean;
  data?: VacationResult;
  availableDays?: number;
  onSubmit: (data: VacationFormData) => void;
}

export const WelcomeBlock = ({
  ready = false,
  isLoading = false,
  data,
  availableDays,
  onSubmit,
}: WelcomeBlockProps) => (
  <Card>
    <CardContent className="flex flex-col lg:flex-row gap-8 items-center">
      <div className="w-full lg:w-1/3">
        <VacationForm isLoading={isLoading || ready} onSubmit={onSubmit} />
      </div>
      <div className="w-full lg:w-2/3">
        {!isLoading && data ? (
          <VacationSummary
            suggestions={data.suggestions}
            holidays={data.holidays}
            totalVacationDays={availableDays}
          />
        ) : (
          <WelcomePlaceholder isLoading={isLoading} />
        )}
      </div>
    </CardContent>
  </Card>
);
