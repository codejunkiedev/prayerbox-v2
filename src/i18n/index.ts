import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ur from './locales/ur.json';
import ar from './locales/ar.json';

/**
 * App-wide i18next instance. Today only the display-screen weather slide
 * consumes translations; admin/auth/prayer-timing surfaces still ship
 * English-only. New display-facing strings must be added to all three
 * locale JSON files.
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export { i18n };
export { formatNumber, getDir, getFontClass, getLocale } from './format';
export { getWeatherConditionKey } from './weather-conditions';
