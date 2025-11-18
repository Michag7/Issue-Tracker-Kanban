import es from "../../public/locales/es.json";
import en from "../../public/locales/en.json";

const translations = { es, en };

export function getTranslations(locale: string = "es") {
  return translations[locale as keyof typeof translations] || translations.es;
}

export function useTranslations() {
  if (typeof window === "undefined") return getTranslations("es");

  const locale = localStorage.getItem("language") || "es";
  return getTranslations(locale);
}
