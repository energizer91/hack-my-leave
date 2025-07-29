import { OptimizerService } from './optimizer.service';
import { HolidaysService } from './holidays.service';
import { Test } from '@nestjs/testing';
import { STRATEGY_TYPE } from './types';

describe('OptimizerService', () => {
  let service: OptimizerService;
  let holidaysService: HolidaysService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OptimizerService,
        {
          provide: HolidaysService,
          useValue: {
            getHolidays: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OptimizerService);
    holidaysService = module.get(HolidaysService);
  });

  describe('collectHolidays', () => {
    it('filters out holidays that fall on weekends', () => {
      const mockHolidays = [
        { date: '2025-05-01', name: 'Thursday Holiday' }, // Thursday
        { date: '2025-05-03', name: 'Saturday Holiday' }, // Saturday
        { date: '2025-05-04', name: 'Sunday Holiday' }, // Sunday
      ];
      (holidaysService.getHolidays as jest.Mock).mockReturnValue(mockHolidays);

      const result = service.collectHolidays(2025, 'SE');
      expect(result).toEqual([
        { date: '2025-05-01', name: 'Thursday Holiday' },
      ]);
    });
  });

  describe('getOptimizedVacations', () => {
    it('generates optimized vacations from holiday input', () => {
      (holidaysService.getHolidays as jest.Mock).mockReturnValue([
        { date: '2025-05-01', name: 'Labour Day' }, // Thursday
      ]);

      const res = service.getOptimizedVacations(
        2025,
        'SE',
        3,
        STRATEGY_TYPE.OPTIMAL,
        false,
      );

      expect(res.holidays).toHaveLength(1);
      expect(res.suggestions).toBeDefined();
      expect(res.suggestions[0]).toHaveProperty('date');
    });
  });
});
