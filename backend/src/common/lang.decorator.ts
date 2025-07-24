import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import Holidays from 'date-holidays';

const parseAcceptLanguage = (acceptLanguage: string): string[] => {
  try {
    return acceptLanguage
      .split(',')
      .map((lang: string) => {
        const [code] = lang.trim().split(';');
        return code.split('-')[0].toLowerCase();
      })
      .filter(Boolean);
  } catch {
    return ['en'];
  }
};

export const Lang = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const acceptLanguage = request.headers['accept-language'];

    if (!acceptLanguage || typeof acceptLanguage !== 'string') {
      return 'en';
    }

    const preferredLanguages = parseAcceptLanguage(acceptLanguage);

    try {
      const hd = new Holidays(); // Без параметров - общая проверка
      const supportedLanguages = hd.getLanguages();

      for (const lang of preferredLanguages) {
        if (supportedLanguages.includes(lang)) {
          return lang;
        }
      }

      const fallbackLang = preferredLanguages[0];
      return fallbackLang;
    } catch {
      return preferredLanguages[0] || 'en';
    }
  },
);
