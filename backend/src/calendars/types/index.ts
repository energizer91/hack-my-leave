export enum HOLIDAY_TYPES {
  PUBLIC = 'Public',
  BANK = 'Bank', // Bank holiday, banks and offices are closed
  SCHOOL = 'School', // School holiday, schools are closed
  AUTHORITIES = 'Authorities', // Authorities are closed
  OPTIONAL = 'Optional', // The majority of people take a day off
  OBSERVANCE = 'Observance', // Optional festivity, no paid day off
}

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: HOLIDAY_TYPES[];
}

export interface VacationSuggestion {
  start: string;
  end: string;
  name: string;
  classifiedVacations: {
    strong: string[];
    weak: string[];
  };
  efficiency: number;
  vacationUsed: string[];
}
