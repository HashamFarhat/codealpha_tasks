import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      connectShareInteract: 'Connect, Share, and Interact in Real-time.',
    },
  },
  es: {
    translation: {
      connectShareInteract: 'Conéctate, comparte e interactúa en tiempo real.',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects from XSS by auto-escaping values
    },
  });

export default i18n;
