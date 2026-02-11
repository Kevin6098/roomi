/**
 * Prefecture → cities/wards mapping for Japan.
 * Used for structured location (prefecture + city); exact_location is optional and hidden by default.
 */

export const UNDECIDED = 'Undecided';
export const OTHER = 'Other';

export const PREFECTURES = [
  UNDECIDED,
  'Hokkaido',
  'Aomori',
  'Iwate',
  'Miyagi',
  'Akita',
  'Yamagata',
  'Fukushima',
  'Ibaraki',
  'Tochigi',
  'Gunma',
  'Saitama',
  'Chiba',
  'Tokyo',
  'Kanagawa',
  'Niigata',
  'Toyama',
  'Ishikawa',
  'Fukui',
  'Yamanashi',
  'Nagano',
  'Gifu',
  'Shizuoka',
  'Aichi',
  'Mie',
  'Shiga',
  'Kyoto',
  'Osaka',
  'Hyogo',
  'Nara',
  'Wakayama',
  'Tottori',
  'Shimane',
  'Okayama',
  'Hiroshima',
  'Yamaguchi',
  'Tokushima',
  'Kagawa',
  'Ehime',
  'Kochi',
  'Fukuoka',
  'Saga',
  'Nagasaki',
  'Kumamoto',
  'Oita',
  'Miyazaki',
  'Kagoshima',
  'Okinawa',
] as const;

export const PREFECTURE_CITIES: Record<string, readonly string[]> = {
  [UNDECIDED]: [UNDECIDED],
  Hokkaido: ['Sapporo', 'Asahikawa', 'Hakodate', 'Kushiro', 'Obihiro', 'Otaru', 'Other'],
  Tokyo: [
    'Shinjuku', 'Shibuya', 'Minato', 'Chiyoda', 'Chuo', 'Taito', 'Sumida', 'Koto', 'Shinagawa',
    'Meguro', 'Ota', 'Setagaya', 'Nakano', 'Suginami', 'Toshima', 'Kita', 'Arakawa', 'Itabashi',
    'Nerima', 'Adachi', 'Katsushika', 'Edogawa', 'Other',
  ],
  Kanagawa: ['Yokohama', 'Kawasaki', 'Sagamihara', 'Fujisawa', 'Other'],
  Osaka: ['Osaka', 'Sakai', 'Higashiosaka', 'Other'],
  Aichi: ['Nagoya', 'Toyota', 'Okazaki', 'Other'],
  Fukuoka: ['Fukuoka', 'Kitakyushu', 'Other'],
  Kyoto: ['Kyoto', 'Uji', 'Other'],
  Saitama: ['Saitama', 'Kawagoe', 'Kawaguchi', 'Tokorozawa', 'Other'],
  Chiba: ['Chiba', 'Funabashi', 'Matsudo', 'Other'],
  Hyogo: ['Kobe', 'Himeji', 'Nishinomiya', 'Other'],
};

export function getCitiesForPrefecture(prefecture: string): readonly string[] {
  if (!prefecture) return [UNDECIDED];
  return PREFECTURE_CITIES[prefecture] ?? [UNDECIDED, OTHER];
}

export function getDisplayLocation(prefecture: string | null | undefined, city: string | null | undefined): string {
  const p = prefecture?.trim() || UNDECIDED;
  const c = city?.trim() || UNDECIDED;
  if (p === UNDECIDED && c === UNDECIDED) return UNDECIDED;
  return `${p}, ${c}`;
}
