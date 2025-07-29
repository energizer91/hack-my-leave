import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { RankingWeights, VacationSuggestion } from '../types';
import { HolidaysTypes } from 'date-holidays';

dayjs.extend(weekOfYear);

const DEFAULT_WEIGHTS: RankingWeights = {
  efficiency: 0.25,
  duration: 0.15,
  seasonality: 0.15,
  clustering: 0.15,
  weekPosition: 0.1,
  monthBalance: 0.1,
  holidayProximity: 0.1,
  type: 0.5,
};

export class AdvancedVacationRanker {
  constructor(private readonly weights: RankingWeights = DEFAULT_WEIGHTS) {}

  /**
   * Основная функция ранжирования отпускного периода
   */
  rankVacationPeriod(suggestion: VacationSuggestion): number {
    const startDate = dayjs(suggestion.start);
    const endDate = dayjs(suggestion.end);
    const vacationDays = suggestion.vacations.map((d) => dayjs(d));

    const scores: RankingWeights = {
      efficiency: this.calculateEfficiencyScore(suggestion),
      duration: this.calculateDurationScore(startDate, endDate),
      seasonality: this.calculateSeasonalityScore(startDate, endDate),
      clustering: this.calculateClusteringScore(vacationDays),
      weekPosition: this.calculateWeekPositionScore(startDate, endDate),
      monthBalance: this.calculateMonthBalanceScore(startDate),
      holidayProximity: this.calculateHolidayProximityScore(suggestion),
      type: this.calculateTypeScore(suggestion.type),
    };

    // Взвешенная сумма всех факторов
    const totalScore = Object.entries(scores).reduce(
      (sum, [key, score]) => sum + score * this.weights[key],
      0,
    );

    return Math.round(totalScore * 100) / 100; // округление до 2 знаков
  }

  /**
   * Тип: отдавать предпочтение праздникам с отпусками, однако учитывать влияние необязательных
   */
  private calculateTypeScore(type: HolidaysTypes.HolidayType) {
    switch (type) {
      case 'public':
      case 'bank':
      case 'school':
        return 100;
      case 'observance':
      case 'optional':
      default:
        return 0;
    }
  }

  /**
   * Эффективность: соотношение общих выходных дней к потраченным отпускным дням
   */
  private calculateEfficiencyScore(suggestion: VacationSuggestion): number {
    const totalDays =
      dayjs(suggestion.end).diff(dayjs(suggestion.start), 'days') + 1;
    const vacationDaysUsed = suggestion.vacations.length;

    if (vacationDaysUsed === 0) return 0;

    const efficiency = totalDays / vacationDaysUsed;

    // Нормализация: отлично если получаем 3+ дня отдыха за 1 день отпуска
    return Math.min(efficiency / 3, 1) * 100;
  }

  /**
   * Длительность: предпочтение более длинным отпускам
   */
  private calculateDurationScore(start: dayjs.Dayjs, end: dayjs.Dayjs): number {
    const duration = end.diff(start, 'days') + 1;

    // Оптимальная длительность 7-14 дней
    if (duration >= 7 && duration <= 14) return 100;
    if (duration >= 5 && duration <= 16) return 80;
    if (duration >= 3 && duration <= 18) return 60;
    if (duration >= 2) return 40;
    return 20;
  }

  /**
   * Сезонность: предпочтение летним месяцам и новогодним каникулам
   */
  private calculateSeasonalityScore(
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
  ): number {
    const startMonth = start.month();
    const endMonth = end.month();

    const seasonalScores = {
      0: 95, // Январь (новогодние)
      1: 40, // Февраль
      2: 50, // Март
      3: 60, // Апрель
      4: 70, // Май
      5: 85, // Июнь
      6: 95, // Июль
      7: 90, // Август
      8: 70, // Сентябрь
      9: 60, // Октябрь
      10: 40, // Ноябрь
      11: 95, // Декабрь (новогодние)
    };

    // Если отпуск пересекает несколько месяцев, берем среднее
    const months: number[] = [];
    for (let m = startMonth; m <= endMonth; m++) {
      months.push(m);
    }

    return (
      months.reduce(
        (sum, month) => sum + (seasonalScores[month] as number),
        0,
      ) / months.length
    );
  }

  /**
   * Кластеризация: предпочтение компактным периодам без больших разрывов
   */
  private calculateClusteringScore(vacationDays: dayjs.Dayjs[]): number {
    if (vacationDays.length <= 1) return 100;

    const sorted = vacationDays.toSorted((a, b) => a.valueOf() - b.valueOf());
    const gaps: number[] = [];

    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].diff(sorted[i - 1], 'days') - 1;
      gaps.push(gap);
    }

    const maxGap = Math.max(...gaps);
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

    // Штрафуем за большие разрывы
    if (maxGap === 0) return 100; // все дни подряд
    if (maxGap <= 2) return 80; // небольшие выходные между днями
    if (maxGap <= 7) return 60; // разрыв в неделю
    if (avgGap <= 3) return 40; // в среднем небольшие разрывы
    return 20;
  }

  /**
   * Позиция в неделе: предпочтение периодам, начинающимся в пятницу или понедельник
   */
  private calculateWeekPositionScore(
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
  ): number {
    const startDay = start.day(); // 0 = воскресенье, 1 = понедельник, 5 = пятница
    const endDay = end.day();

    let score = 50; // базовый балл

    // Бонус за начало в понедельник или пятницу
    if (startDay === 1) score += 25; // понедельник
    if (startDay === 5) score += 20; // пятница

    // Бонус за окончание в пятницу или воскресенье
    if (endDay === 5) score += 15; // пятница
    if (endDay === 0) score += 10; // воскресенье

    // Штраф за начало/окончание в середине недели
    if (startDay >= 2 && startDay <= 4) score -= 10;
    if (endDay >= 1 && endDay <= 4) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Баланс по месяцам: предпочтение равномерному распределению отпусков
   */
  private calculateMonthBalanceScore(start: dayjs.Dayjs) {
    const month = start.month();

    // Эмпирическая оценка: предпочтение месяцам, где меньше конкуренции
    const competitionScore = {
      0: 60, // Январь - много желающих из-за НГ
      1: 80, // Февраль - меньше конкуренции
      2: 70, // Март
      3: 75, // Апрель
      4: 65, // Май - много праздников
      5: 50, // Июнь - популярный
      6: 40, // Июль - самый популярный
      7: 45, // Август - очень популярный
      8: 85, // Сентябрь - меньше желающих
      9: 90, // Октябрь - непопулярный
      10: 85, // Ноябрь - непопулярный
      11: 55, // Декабрь - НГ каникулы
    };

    return competitionScore[month] as number;
  }

  /**
   * Близость к праздникам: дополнительные баллы за использование праздничных дней
   */
  private calculateHolidayProximityScore(
    suggestion: VacationSuggestion,
  ): number {
    const holidayDate = dayjs(suggestion.date);
    const startDate = dayjs(suggestion.start);
    const endDate = dayjs(suggestion.end);

    // Базовый балл за использование праздника
    let score = 50;

    // Бонус за эффективное использование праздничного дня
    const totalPeriod = endDate.diff(startDate, 'days') + 1;
    const vacationDaysUsed = suggestion.vacations.length;

    if (totalPeriod >= 9 && vacationDaysUsed <= 4)
      score += 30; // отличная эффективность
    else if (totalPeriod >= 7 && vacationDaysUsed <= 3) score += 25;
    else if (totalPeriod >= 5 && vacationDaysUsed <= 2) score += 20;
    else if (totalPeriod >= 3 && vacationDaysUsed <= 1) score += 15;

    // Дополнительный бонус, если праздник в центре отпуска (не в начале/конце)
    const holidayPosition =
      holidayDate.diff(startDate, 'days') / (totalPeriod - 1);
    if (holidayPosition > 0.2 && holidayPosition < 0.8) {
      score += 10; // праздник в середине отпуска
    }

    return Math.min(100, score);
  }
}
