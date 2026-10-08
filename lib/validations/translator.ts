export type ValidationTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;
