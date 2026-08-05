import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { GameMessage } from '../game/types';
import {
  getPlayerNameKey,
  interpolate,
  Locale,
  TranslationKey,
  translations,
} from './translations';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatMessage: (message: GameMessage) => string;
  playerName: (name: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function translate(
  locale: Locale,
  key: TranslationKey,
  params: Record<string, string | number> = {},
): string {
  const template = translations[locale][key] ?? translations.en[key] ?? key;
  return interpolate(template, params);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const playerName = useCallback(
    (name: string) => {
      const key = getPlayerNameKey(name);
      return key ? translate(locale, key) : name;
    },
    [locale],
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const formatMessage = useCallback(
    (message: GameMessage) => {
      const params: Record<string, string | number | boolean> = { ...message.params };

      for (const key of ['name', 'penalizedName', 'matchWinner'] as const) {
        if (typeof params[key] === 'string') {
          params[key] = playerName(String(params[key]));
        }
      }

      if (typeof params.reasonKey === 'string') {
        params.reason = t(params.reasonKey as TranslationKey);
        delete params.reasonKey;
      }

      if (message.key === 'msg.roundWin') {
        let text = t('msg.roundWin', {
          name: String(params.name ?? ''),
          round: Number(params.round ?? 0),
        });
        const queenCount = Number(params.queenCount ?? 0);
        if (queenCount > 0) {
          text += ` ${t('msg.queenBonus', { points: 30 * queenCount })}`;
        }
        if (params.matchWinner) {
          text += ` ${
            params.matchWinnerIsYou
              ? t('msg.matchWinSuffixYou')
              : t('msg.matchWinSuffix', { name: String(params.matchWinner) })
          }`;
        }
        return text;
      }

      const { queenCount: _queenCount, matchWinner: _matchWinner, matchWinnerIsYou: _matchWinnerIsYou, ...rest } =
        params;
      return t(message.key as TranslationKey, rest as Record<string, string | number>);
    },
    [playerName, t],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      formatMessage,
      playerName,
    }),
    [formatMessage, locale, playerName, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
