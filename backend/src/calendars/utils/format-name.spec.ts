import { formatName } from './format-name';
import { HOLIDAY_TYPES } from '../types';

describe('formatName', () => {
  it('returns combined name if localName differs', () => {
    const holiday = {
      date: '2025-01-01',
      fixed: false,
      global: true,
      counties: ['SE'],
      countryCode: 'SE',
      launchYear: null,
      types: [HOLIDAY_TYPES.PUBLIC],
      name: 'National Day',
      localName: 'Staatsfeiertag',
    };

    expect(formatName(holiday)).toBe('Staatsfeiertag (National Day)');
  });

  it('returns name only if names match', () => {
    const holiday = {
      date: '2025-01-01',
      fixed: false,
      global: true,
      counties: ['SE'],
      countryCode: 'SE',
      launchYear: null,
      types: [HOLIDAY_TYPES.PUBLIC],
      name: 'Easter',
      localName: 'Easter',
    };

    expect(formatName(holiday)).toBe('Easter');
  });
});
