import dayjs from 'dayjs';
import { VacationSuggestion } from '../types';

type NormalizedVacation = Pick<
  VacationSuggestion,
  'name' | 'date' | 'start' | 'end' | 'vacations' | 'type'
>;

export const bridgeVacations = (
  suggestions: VacationSuggestion[],
  remainingVacationDays: number,
) => {
  let remaining = remainingVacationDays;
  // look for the closest suggestion
  // if before or after a weekend (day === 1 || day === 5) -> add them
  // if difference between suggestions is 0 combine them
  const result = suggestions.reduce((acc, suggestion) => {
    const newSuggestion: NormalizedVacation = {
      name: suggestion.name,
      start: suggestion.start,
      end: suggestion.end,
      date: suggestion.date,
      type: suggestion.type,
      vacations: suggestion.vacations.slice(),
    };

    if (acc[acc.length - 1]) {
      // don't add segment which is already there
      // instead extend previous ranges with current
      const previous = acc[acc.length - 1];

      if (previous.date === suggestion.date) {
        previous.end = newSuggestion.end;
        previous.vacations.push(...newSuggestion.vacations);

        return acc;
      }

      const daysBeforePrevious =
        dayjs(newSuggestion.start).diff(previous.end, 'days') - 1;

      // try to increase previous vacations by the number of remaining
      // unstable, might be rebuilt
      if (daysBeforePrevious > 0 && daysBeforePrevious <= remaining) {
        for (let i = 0; i < daysBeforePrevious; i++) {
          newSuggestion.vacations.unshift(
            dayjs(newSuggestion.start)
              .subtract(i + 1, 'days')
              .format('YYYY-MM-DD'),
          );
        }

        newSuggestion.start = newSuggestion.vacations[0]!;

        remaining -= daysBeforePrevious;
      }
    }

    return acc.concat(newSuggestion);
  }, [] as NormalizedVacation[]);

  return {
    result,
    remainingVacationDays: remaining,
  };
};
