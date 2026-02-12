/**
 * Prefecture → cities/wards mapping for Japan.
 * All 47 prefectures have city/ward options; exact_location is optional.
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
  Hokkaido: ['Sapporo', 'Asahikawa', 'Hakodate', 'Kushiro', 'Obihiro', 'Otaru', 'Kitami', 'Ebetsu', 'Other'],
  Aomori: ['Aomori', 'Hachinohe', 'Hirosaki', 'Towada', 'Mutsu', 'Goshogawara', 'Other'],
  Iwate: ['Morioka', 'Oshu', 'Ichinoseki', 'Hanamaki', 'Kitakami', 'Miyako', 'Kamaishi', 'Other'],
  Miyagi: ['Sendai', 'Ishinomaki', 'Osaki', 'Natori', 'Shiogama', 'Kesennuma', 'Other'],
  Akita: ['Akita', 'Yokote', 'Yurihonjo', 'Oga', 'Daisen', 'Other'],
  Yamagata: ['Yamagata', 'Tsuruoka', 'Sagae', 'Shinjo', 'Yonezawa', 'Other'],
  Fukushima: ['Fukushima', 'Koriyama', 'Iwaki', 'Aizuwakamatsu', 'Sukagawa', 'Other'],
  Ibaraki: ['Mito', 'Hitachi', 'Tsukuba', 'Hitachinaka', 'Koga', 'Kasama', 'Other'],
  Tochigi: ['Utsunomiya', 'Ashikaga', 'Tochigi', 'Oyama', 'Kanuma', 'Other'],
  Gunma: ['Maebashi', 'Takasaki', 'Kiryu', 'Isesaki', 'Ota', 'Numata', 'Other'],
  Saitama: ['Saitama', 'Kawagoe', 'Kawaguchi', 'Tokorozawa', 'Koshigaya', 'Soka', 'Other'],
  Chiba: ['Chiba', 'Funabashi', 'Matsudo', 'Ichikawa', 'Kashiwa', 'Narashino', 'Other'],
  Tokyo: [
    'Shinjuku', 'Shibuya', 'Minato', 'Chiyoda', 'Chuo', 'Taito', 'Sumida', 'Koto', 'Shinagawa',
    'Meguro', 'Ota', 'Setagaya', 'Nakano', 'Suginami', 'Toshima', 'Kita', 'Arakawa', 'Itabashi',
    'Nerima', 'Adachi', 'Katsushika', 'Edogawa', 'Other',
  ],
  Kanagawa: ['Yokohama', 'Kawasaki', 'Sagamihara', 'Fujisawa', 'Hiratsuka', 'Kamakura', 'Other'],
  Niigata: ['Niigata', 'Nagaoka', 'Joetsu', 'Sanjo', 'Kashiwazaki', 'Shibata', 'Other'],
  Toyama: ['Toyama', 'Takaoka', 'Uozu', 'Namerikawa', 'Other'],
  Ishikawa: ['Kanazawa', 'Hakusan', 'Komatsu', 'Kaga', 'Nonoichi', 'Other'],
  Fukui: ['Fukui', 'Tsuruga', 'Obama', 'Echizen', 'Sabae', 'Other'],
  Yamanashi: ['Kofu', 'Fujiyoshida', 'Tsuru', 'Nirasaki', 'Other'],
  Nagano: ['Nagano', 'Matsumoto', 'Okaya', 'Iida', 'Ina', 'Suzaka', 'Other'],
  Gifu: ['Gifu', 'Ogaki', 'Takayama', 'Tajimi', 'Seki', 'Mino', 'Other'],
  Shizuoka: ['Shizuoka', 'Hamamatsu', 'Numazu', 'Fuji', 'Mishima', 'Ito', 'Other'],
  Aichi: ['Nagoya', 'Toyota', 'Okazaki', 'Ichinomiya', 'Kasugai', 'Anjo', 'Other'],
  Mie: ['Tsu', 'Yokkaichi', 'Ise', 'Matsusaka', 'Kuwana', 'Suzuka', 'Other'],
  Shiga: ['Otsu', 'Kusatsu', 'Hikone', 'Nagahama', 'Omihachiman', 'Koka', 'Other'],
  Kyoto: ['Kyoto', 'Uji', 'Maizuru', 'Kameoka', 'Muko', 'Nagaokakyo', 'Other'],
  Osaka: ['Osaka', 'Sakai', 'Higashiosaka', 'Hirakata', 'Toyonaka', 'Suita', 'Other'],
  Hyogo: ['Kobe', 'Himeji', 'Nishinomiya', 'Amagasaki', 'Akashi', 'Kakogawa', 'Other'],
  Nara: ['Nara', 'Kashihara', 'Yamatotakada', 'Tenri', 'Ikoma', 'Yamatokoriyama', 'Other'],
  Wakayama: ['Wakayama', 'Kainan', 'Hashimoto', 'Tanabe', 'Gobo', 'Other'],
  Tottori: ['Tottori', 'Yonago', 'Sakaiminato', 'Kurayoshi', 'Other'],
  Shimane: ['Matsue', 'Izumo', 'Masuda', 'Hamada', 'Oda', 'Other'],
  Okayama: ['Okayama', 'Kurashiki', 'Tsuyama', 'Tamano', 'Kasaoka', 'Other'],
  Hiroshima: ['Hiroshima', 'Fukuyama', 'Kure', 'Higashihiroshima', 'Onomichi', 'Hatsukaichi', 'Other'],
  Yamaguchi: ['Shimonoseki', 'Ube', 'Yamaguchi', 'Hofu', 'Iwakuni', 'Hikari', 'Other'],
  Tokushima: ['Tokushima', 'Naruto', 'Anan', 'Komatsushima', 'Other'],
  Kagawa: ['Takamatsu', 'Marugame', 'Sakaide', 'Higashikagawa', 'Other'],
  Ehime: ['Matsuyama', 'Niihama', 'Imabari', 'Saijo', 'Ozu', 'Other'],
  Kochi: ['Kochi', 'Sukumo', 'Shimanto', 'Nankoku', 'Other'],
  Fukuoka: ['Fukuoka', 'Kitakyushu', 'Omuta', 'Kurume', 'Iizuka', 'Chikushino', 'Other'],
  Saga: ['Saga', 'Karatsu', 'Tosu', 'Imari', 'Takeo', 'Other'],
  Nagasaki: ['Nagasaki', 'Sasebo', 'Isahaya', 'Omura', 'Shimabara', 'Other'],
  Kumamoto: ['Kumamoto', 'Hitoyoshi', 'Arao', 'Tamana', 'Yatsushiro', 'Other'],
  Oita: ['Oita', 'Beppu', 'Nakatsu', 'Saiki', 'Usuki', 'Other'],
  Miyazaki: ['Miyazaki', 'Miyakonojo', 'Nobeoka', 'Hyuga', 'Nichinan', 'Other'],
  Kagoshima: ['Kagoshima', 'Kirishima', 'Kanoya', 'Satsumasendai', 'Makurazaki', 'Other'],
  Okinawa: ['Naha', 'Okinawa', 'Urasoe', 'Nago', 'Ginowan', 'Ishigaki', 'Nanjō', 'Other'],
};

export function getCitiesForPrefecture(prefecture: string): readonly string[] {
  if (!prefecture) return [UNDECIDED];
  return PREFECTURE_CITIES[prefecture] ?? [UNDECIDED, OTHER];
}

export function getDisplayLocation(prefecture: string | null | undefined, city: string | null | undefined, _lang?: string): string {
  const p = prefecture?.trim() || UNDECIDED;
  const c = city?.trim() || UNDECIDED;
  if (p === UNDECIDED && c === UNDECIDED) return UNDECIDED;
  return `${p}, ${c}`;
}
