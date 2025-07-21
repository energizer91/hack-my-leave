import { Strategy, STRATEGY_TYPE, VacationSuggestion } from '../types';

export const optimalStrategy = (
  suggestions: VacationSuggestion[],
  vacationDays: number,
) => {
  const result = suggestions.slice();
  const sorted = result.toSorted((a, b) => b.score - a.score);
  let remainingVacationDays = vacationDays;

  if (remainingVacationDays >= 0) {
    return {
      result,
      remainingVacationDays,
    };
  }

  while (remainingVacationDays < 0) {
    const toRemove = sorted.pop();

    if (!toRemove) break;

    const suggestionIndex = result.findIndex((s) => s.id === toRemove.id);

    if (suggestionIndex < 0) break;

    remainingVacationDays += result[suggestionIndex].vacations.length;

    result.splice(suggestionIndex, 1);
  }

  return { result, remainingVacationDays };
};

export const aggressiveStrategy = (
  suggestions: VacationSuggestion[],
  vacationDays: number,
) => {
  const result = suggestions.slice();
  const sorted = result.toSorted((a, b) => a.score - b.score);
  let remainingVacationDays = vacationDays;

  if (remainingVacationDays >= 0) {
    return {
      result,
      remainingVacationDays,
    };
  }

  while (remainingVacationDays < 0) {
    let toRemove = sorted.findIndex(
      (s) => s.vacations.length <= Math.abs(remainingVacationDays),
    );

    if (toRemove < 0) {
      if (sorted.length) {
        toRemove = 0;
      } else break;
    }

    const suggestionIndex = result.findIndex(
      (s) => s.id === sorted[toRemove].id,
    );

    if (suggestionIndex < 0) break;

    remainingVacationDays += result[suggestionIndex].vacations.length;

    sorted.splice(toRemove, 1);
    result.splice(suggestionIndex, 1);
  }

  return { result, remainingVacationDays };
};

const straightStrategy = (
  suggestions: VacationSuggestion[],
  vacationDays: number,
) => {
  return {
    result: suggestions,
    remainingVacationDays: vacationDays,
  };
};

export const strategies: Record<STRATEGY_TYPE, Strategy> = {
  [STRATEGY_TYPE.OPTIMAL]: {
    name: 'Optimal',
    description: 'Retains best-value vacations as long as possible',
    apply: optimalStrategy,
  },
  [STRATEGY_TYPE.AGGRESSIVE]: {
    name: 'Aggressive',
    description: 'Minimizes vacation debt at all cost',
    apply: aggressiveStrategy,
  },
  [STRATEGY_TYPE.STRAIGHT]: {
    name: 'Straight',
    description: 'Give it as it is',
    apply: straightStrategy,
  },
};
