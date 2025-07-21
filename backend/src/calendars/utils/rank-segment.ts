import dayjs from 'dayjs';

export function rankVacationSegment(
  vacationDays: dayjs.Dayjs[],
  holidayDays: Set<string>,
) {
  let score = 0;

  for (const d of vacationDays) {
    const prev = d.subtract(1, 'day').format('YYYY-MM-DD');
    const next = d.add(1, 'day').format('YYYY-MM-DD');
    const date = d.format('YYYY-MM-DD');

    const nearHoliday =
      holidayDays.has(prev) || holidayDays.has(next) || holidayDays.has(date);
    const nearWeekend = d.day() === 1 || d.day() === 5;

    if (nearHoliday) score += 2;
    else if (nearWeekend) score += 1;
    else score -= 1; // в центре недели, бесполезный
  }

  return score / vacationDays.length;
}
