type LabelTranslator = {
  (key: string): string;
  has(key: string): boolean;
};

export type DomainGroup = 'roles' | 'leaveTypes' | 'actions' | 'entities' | 'documentTypes';

export function localizedDomainLabel(t: LabelTranslator, group: DomainGroup, value?: string | null): string {
  const key = `${group}.${value}`;
  return value && t.has(key) ? t(key) : t('unknown');
}
