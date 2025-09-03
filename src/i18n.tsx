import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./assets/locales/en/translation.json";
import translationMYML from "./assets/locales/my-ml/translation.json";
import translationMYMN from "./assets/locales/my-mn/translation.json";
import translationMYTM from "./assets/locales/my-tm/translation.json";
// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  myML: {
    translation: translationMYML,
  },
  myMN: {
    translation: translationMYMN,
  },
  myTM: {
    translation: translationMYTM,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
