import { OptimizerService } from './optimizer.service';
import { HolidaysService } from './holidays.service';
import dayjs from 'dayjs';

describe('OptimizerService', () => {
  let optimizerService: OptimizerService;
  let holidaysService: HolidaysService;

  beforeEach(() => {
    holidaysService = {
      getPublicHolidays: jest.fn(),
    } as any;

    optimizerService = new OptimizerService(holidaysService);
  });

  it('should skip holidays that fall on weekends', async () => {
    (holidaysService.getPublicHolidays as jest.Mock).mockResolvedValue([
      { date: '2025-01-05' }, // Sunday
    ]);

    const result = await optimizerService.getOptimizedVacations(2025, 'SE', 5);
    expect(result.suggestions).toHaveLength(0);
    expect(result.remainingVacationDays).toBe(5);
  });

  it('should suggest vacation bridging to weekend', async () => {
    (holidaysService.getPublicHolidays as jest.Mock).mockResolvedValue([
      { date: '2025-01-01' }, // Wednesday
    ]);

    const result = await optimizerService.getOptimizedVacations(2025, 'SE', 5);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]).toEqual({
      start: '2025-01-01',
      end: '2025-01-03',
      vacationUsed: ['2025-01-02', '2025-01-03'],
    });
    expect(result.remainingVacationDays).toBe(3);
  });

  it('should skip holidays that fall on Friday', async () => {
    (holidaysService.getPublicHolidays as jest.Mock).mockResolvedValue([
      { date: '2025-01-03' }, // Friday
    ]);

    const result = await optimizerService.getOptimizedVacations(2025, 'SE', 5);
    expect(result.suggestions).toHaveLength(0);
    expect(result.remainingVacationDays).toBe(5);
  });

  it('should not suggest overlapping vacation periods', async () => {
    (holidaysService.getPublicHolidays as jest.Mock).mockResolvedValue([
      { date: '2025-01-01' }, // Wednesday
      { date: '2025-01-02' }, // Thursday (overlaps with prior suggestion)
    ]);

    const result = await optimizerService.getOptimizedVacations(2025, 'SE', 10);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].start).toBe('2025-01-01');
    expect(result.remainingVacationDays).toBeLessThan(10);
  });

  it('should respect year boundary and not suggest vacations into next year', async () => {
    (holidaysService.getPublicHolidays as jest.Mock).mockResolvedValue([
      { date: '2025-12-30' }, // Tuesday
    ]);

    const result = await optimizerService.getOptimizedVacations(2025, 'SE', 10);
    expect(result.suggestions).toHaveLength(1);
    const used = result.suggestions[0].vacationUsed;
    expect(used.every((d) => dayjs(d).year() === 2025)).toBe(true);
  });
});
