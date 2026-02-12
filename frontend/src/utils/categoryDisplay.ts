/**
 * Localized display names for main and sub categories.
 * Prefers nameJa when lang is 'ja', otherwise nameEn or name.
 */

export type CategoryWithNames = {
  name: string;
  nameEn?: string | null;
  nameJa?: string | null;
};

export function getMainCategoryDisplayName(
  main: CategoryWithNames | null | undefined,
  lang: string
): string {
  if (!main) return '—';
  if (lang === 'ja' && main.nameJa) return main.nameJa;
  return (main.nameEn ?? main.name) || '—';
}

export function getSubCategoryDisplayName(
  sub: CategoryWithNames | null | undefined,
  lang: string
): string {
  if (!sub) return '—';
  if (lang === 'ja' && sub.nameJa) return sub.nameJa;
  return (sub.nameEn ?? sub.name) || '—';
}
