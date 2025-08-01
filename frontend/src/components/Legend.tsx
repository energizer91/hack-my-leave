import React from 'react';
import { holidayTypes } from '@/lib/holidayTypes.ts';

interface LegendItem {
  label: string;
  color: string;
  description?: string;
}

interface LegendProps {
  items?: LegendItem[];
}

const defaultItems = Object.values(holidayTypes);

export const Legend: React.FC<LegendProps> = ({ items = defaultItems }) => {
  return (
    <figure
      className="mb-6 flex flex-wrap gap-6 gap-y-2 justify-center items-center"
      aria-label="Calendar legend showing different types of days"
    >
      <figcaption className="sr-only">
        Legend explaining the color coding used in the vacation calendar
      </figcaption>

      {items.map((item) => (
        <dl key={item.label} className="flex items-center gap-2 text-sm">
          <dt className="sr-only">{item.label}</dt>
          <dd
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
            aria-label={`${item.label} indicator`}
          />
          <dd className="text-slate-900 font-medium">{item.label}</dd>
        </dl>
      ))}
    </figure>
  );
};
