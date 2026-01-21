interface HolidayLegendItem {
  label: string;
  color: string;
  text?: string;
}

export const holidayTypes: Record<string, HolidayLegendItem> = {
  vacation: {
    label: 'Your vacation days',
    color: 'var(--color-violet-200)',
  },
  holiday: {
    label: 'Public holidays',
    color: 'var(--color-red-200)',
    text: 'var(--color-red-700)',
  },
  additional: {
    label: 'Additional days',
    color: 'var(--color-lime-200)',
  },
  optional: {
    label: 'Optional holidays',
    color: 'var(--color-yellow-200)',
  },
};
