import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locale === "en" || locale === "es" ? locale : "es";

  return {
    locale: validLocale,
    messages: (await import(`../../public/locales/${validLocale}.json`))
      .default,
  };
});
