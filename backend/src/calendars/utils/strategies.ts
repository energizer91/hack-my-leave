import {
  SELECTION_PRIORITY,
  Strategy,
  STRATEGY_TYPE,
  VacationSuggestion,
} from '../types';

/**
 * Получает все уникальные отпускные дни из списка предложений
 */
export const getTotalVacationDaysCount = (
  suggestions: VacationSuggestion[],
): number => {
  const allDays = new Set<string>();
  suggestions.forEach((s) =>
    s.vacations.forEach((day) => day !== s.date && allDays.add(day)),
  );
  return allDays.size;
};

/**
 * Универсальная функция отбора предложений
 */
const selectSuggestions = (
  suggestions: VacationSuggestion[],
  remainingVacationDays: number,
  priority: SELECTION_PRIORITY,
): { result: VacationSuggestion[]; remainingVacationDays: number } => {
  const result = suggestions.slice();

  if (remainingVacationDays >= 0) {
    return { result, remainingVacationDays };
  }

  // Рассчитываем метрики для каждого предложения
  const withMetrics = result.map((s) => {
    const totalDays =
      Math.ceil(
        (new Date(s.end).getTime() - new Date(s.start).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;
    const efficiency =
      s.vacations.length > 0 ? totalDays / s.vacations.length : 0;
    const scorePerDay =
      s.vacations.length > 0 ? s.score / s.vacations.length : 0;
    const duration = s.vacations.length;

    let removalPriority: number;

    switch (priority) {
      case SELECTION_PRIORITY.SCORE:
        removalPriority = s.score;
        break;
      case SELECTION_PRIORITY.EFFICIENCY:
        removalPriority = (efficiency * s.score) / 100; // комбинированная эффективность
        break;
      case SELECTION_PRIORITY.DURATION:
        removalPriority = duration * (s.score / 100); // предпочтение длинным отпускам
        break;
      case SELECTION_PRIORITY.SMART:
        removalPriority = s.score * 0.4 + efficiency * 20 + duration * 5;
        break;
      default:
        removalPriority = s.score;
        break;
    }

    return {
      ...s,
      efficiency,
      scorePerDay,
      duration,
      removalPriority,
    };
  });

  // Сортируем по возрастанию приоритета удаления (худшие первыми)
  const sorted = withMetrics.toSorted(
    (a, b) => a.removalPriority - b.removalPriority,
  );
  let deficit = Math.abs(remainingVacationDays);

  // Обычное удаление по приоритету
  while (deficit > 0 && sorted.length > 0) {
    const toRemove = sorted.shift()!;
    const suggestionIndex = result.findIndex((s) => s.id === toRemove.id);

    if (suggestionIndex >= 0) {
      deficit -= result[suggestionIndex].vacations.length;
      result.splice(suggestionIndex, 1);
    }
  }

  return { result, remainingVacationDays: -deficit };
};

/**
 * Специальная логика для balanced стратегии
 */
const balancedSelection = (
  suggestions: VacationSuggestion[],
  remainingVacationDays: number,
): { result: VacationSuggestion[]; remainingVacationDays: number } => {
  const result = suggestions.slice();

  // Группируем по кварталам
  const quarters = {
    Q1: [] as VacationSuggestion[],
    Q2: [] as VacationSuggestion[],
    Q3: [] as VacationSuggestion[],
    Q4: [] as VacationSuggestion[],
  };

  result.forEach((s) => {
    const month = parseInt(s.start.split('-')[1]) - 1;
    if (month <= 2) quarters.Q1.push(s);
    else if (month <= 5) quarters.Q2.push(s);
    else if (month <= 8) quarters.Q3.push(s);
    else quarters.Q4.push(s);
  });

  // Сортируем каждый квартал по score (худшие первыми)
  Object.values(quarters).forEach((q) =>
    q.toSorted((a, b) => a.score - b.score),
  );

  let deficit = Math.abs(remainingVacationDays);

  // Убираем равномерно из всех кварталов
  while (deficit > 0) {
    let removed = false;

    for (const quarterSuggestions of Object.values(quarters)) {
      if (quarterSuggestions.length > 0 && deficit > 0) {
        const toRemove = quarterSuggestions.shift()!;
        const suggestionIndex = result.findIndex((s) => s.id === toRemove.id);

        if (suggestionIndex >= 0) {
          deficit -= result[suggestionIndex].vacations.length;
          result.splice(suggestionIndex, 1);
          removed = true;
        }
      }
    }

    if (!removed) break;
  }

  return { result, remainingVacationDays: -deficit };
};

export const strategies: Record<STRATEGY_TYPE, Strategy> = {
  [STRATEGY_TYPE.OPTIMAL]: {
    name: 'Optimal',
    description:
      'Maximizes efficiency by selecting vacations with the highest score-to-days ratio',
    rankingWeights: {
      efficiency: 0.45,
      duration: 0.15,
      seasonality: 0.15,
      clustering: 0.15,
      weekPosition: 0.1,
      monthBalance: 0.1,
      holidayProximity: 0.1,
      type: 0.1,
    },
    apply: (suggestions, remainingVacationDays) =>
      selectSuggestions(
        suggestions,
        remainingVacationDays,
        SELECTION_PRIORITY.SCORE,
      ),
  },

  [STRATEGY_TYPE.SEASONAL]: {
    name: 'Seasonal',
    description: 'Focuses on summer and holiday periods for maximum enjoyment',
    rankingWeights: {
      efficiency: 0.15,
      duration: 0.1,
      seasonality: 0.4,
      clustering: 0.1,
      weekPosition: 0.05,
      monthBalance: 0.1,
      holidayProximity: 0.1,
      type: 0.1,
    },
    apply: (suggestions, remainingVacationDays) =>
      selectSuggestions(
        suggestions,
        remainingVacationDays,
        SELECTION_PRIORITY.SCORE,
      ),
  },

  [STRATEGY_TYPE.AGGRESSIVE]: {
    name: 'Aggressive',
    description:
      'Prioritizes maximum rest days by selecting the longest possible vacations',
    rankingWeights: {
      efficiency: 0.4,
      duration: 0.1,
      seasonality: 0.05,
      clustering: 0.15,
      weekPosition: 0.1,
      monthBalance: 0.05,
      holidayProximity: 0.15,
      type: 0.1,
    },
    apply: (suggestions, remainingVacationDays) =>
      selectSuggestions(
        suggestions,
        remainingVacationDays,
        SELECTION_PRIORITY.EFFICIENCY,
      ),
  },

  [STRATEGY_TYPE.STRAIGHT]: {
    name: 'Straight',
    description:
      'Simple approach that selects the best suggestions by overall score',
    rankingWeights: {
      efficiency: 0.25,
      duration: 0.15,
      seasonality: 0.15,
      clustering: 0.15,
      weekPosition: 0.1,
      monthBalance: 0.1,
      holidayProximity: 0.1,
      type: 0.1,
    },
    apply: (suggestions, remainingVacationDays) => ({
      result: suggestions,
      remainingVacationDays,
    }),
  },

  [STRATEGY_TYPE.BALANCED]: {
    name: 'Balance',
    description:
      'Distributes vacations evenly throughout the year for consistent rest',
    rankingWeights: {
      efficiency: 0.15,
      duration: 0.1,
      seasonality: 0.3,
      clustering: 0.1,
      weekPosition: 0.05,
      monthBalance: 0.2,
      holidayProximity: 0.1,
      type: 0.3,
    },
    apply: balancedSelection,
  },

  [STRATEGY_TYPE.SMART]: {
    name: 'Smart',
    description:
      'Intelligently combines efficiency, duration, and seasonal preferences',
    rankingWeights: {
      efficiency: 0.2,
      duration: 0.2,
      seasonality: 0.15,
      clustering: 0.15,
      weekPosition: 0.1,
      monthBalance: 0.1,
      holidayProximity: 0.1,
      type: 0.1,
    },
    apply: (suggestions, remainingVacationDays) =>
      selectSuggestions(
        suggestions,
        remainingVacationDays,
        SELECTION_PRIORITY.SMART,
      ),
  },
  [STRATEGY_TYPE.LONG_VACATIONS]: {
    name: 'Long Vacations',
    description:
      'Prefers fewer but longer vacation periods for extended relaxation',
    rankingWeights: {
      efficiency: 0.15,
      duration: 0.35,
      seasonality: 0.2,
      clustering: 0.2,
      weekPosition: 0.05,
      monthBalance: 0.05,
      holidayProximity: 0,
      type: 0.1,
    },
    apply: (suggestions, remainingVacationDays) =>
      selectSuggestions(
        suggestions,
        remainingVacationDays,
        SELECTION_PRIORITY.DURATION,
      ),
  },
};
