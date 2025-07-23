// components/VacationStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, Gift, AlertCircle } from 'lucide-react';
import type { VacationSuggestion } from '@/types/vacations';
import type { HolidaysTypes } from 'date-holidays';

interface VacationSummaryProps {
  suggestions: VacationSuggestion[];
  holidays: HolidaysTypes.Holiday[];
  totalVacationDays?: number;
}

export const VacationSummary = ({
  suggestions,
  holidays,
  totalVacationDays = 0,
}: VacationSummaryProps) => {
  // Calculate used vacation days
  const usedVacationDays = suggestions.reduce((total, suggestion) => {
    const workingDays = suggestion.vacations.filter((day) => {
      const dayOfWeek = new Date(day).getDay();
      // Исключаем выходные (0 = воскресенье, 6 = суббота)
      return dayOfWeek !== 0 && dayOfWeek !== 6;
    }).length;
    return total + workingDays;
  }, 0);

  // Calculate utilized holidays
  const holidayDates = new Set(holidays.map((h) => h.date));
  const utilizedHolidays = suggestions.filter((suggestion) =>
    holidayDates.has(suggestion.date),
  ).length;

  // Calculate total rest days (including weekends within periods)
  const totalRestDays = suggestions.reduce((total, suggestion) => {
    const start = new Date(suggestion.start);
    const end = new Date(suggestion.end);
    const diffTime = Math.abs(Number(end) - Number(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return total + diffDays;
  }, 0);

  // Efficiency (how many rest days per vacation day used)
  const efficiency = usedVacationDays > 0 ? (totalRestDays / usedVacationDays).toFixed(1) : '0';

  // Check if over budget
  const isOverBudget = usedVacationDays > totalVacationDays;
  const actualRemaining = totalVacationDays - usedVacationDays;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Vacation Statistics
          {isOverBudget && <AlertCircle className="h-4 w-4 text-orange-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Used vacation days */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Vacation days used</span>
          </div>
          <Badge variant={isOverBudget ? 'destructive' : 'secondary'}>
            {usedVacationDays} of {totalVacationDays}
          </Badge>
        </div>

        {/* Remaining days */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm">{isOverBudget ? 'Over budget by' : 'Days remaining'}</span>
          </div>
          <Badge
            variant={isOverBudget ? 'destructive' : actualRemaining > 0 ? 'outline' : 'secondary'}
          >
            {isOverBudget ? Math.abs(actualRemaining) : actualRemaining}
          </Badge>
        </div>

        {/* Alert for over budget */}
        {isOverBudget && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 text-orange-800 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                This strategy uses more vacation days than available. Try a less aggressive strategy
                or increase your vacation budget.
              </span>
            </div>
          </div>
        )}

        {/* Utilized holidays */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-green-500" />
            <span className="text-sm">Holidays utilized</span>
          </div>
          <Badge variant="secondary">
            {utilizedHolidays} of {holidays.length}
          </Badge>
        </div>

        {/* Total rest days */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Total rest days</span>
          </div>
          <Badge variant="default">{totalRestDays}</Badge>
        </div>

        {/* Efficiency */}
        <div className="flex items-center justify-between pt-2 border-t mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Efficiency</span>
          </div>
          <Badge variant="default" className="bg-emerald-100 text-emerald-800">
            {efficiency}x
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
