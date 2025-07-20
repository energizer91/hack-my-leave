import { Holiday } from '../types';

export const formatName = (holiday: Holiday) =>
  holiday.localName !== holiday.name
    ? `${holiday.localName} (${holiday.name})`
    : holiday.name;
