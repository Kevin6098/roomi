/**
 * Prefecture → cities/wards mapping for Japan.
 * All 47 prefectures have city/ward options; exact_location is optional.
 * Japanese display names for locale 'ja'.
 */

export const UNDECIDED = 'Undecided';
export const OTHER = 'Other';

/** Japanese names for prefectures (key = Romaji value stored in DB). */
export const PREFECTURE_JA: Record<string, string> = {
  [UNDECIDED]: '未定',
  [OTHER]: 'その他',
  Hokkaido: '北海道',
  Aomori: '青森県',
  Iwate: '岩手県',
  Miyagi: '宮城県',
  Akita: '秋田県',
  Yamagata: '山形県',
  Fukushima: '福島県',
  Ibaraki: '茨城県',
  Tochigi: '栃木県',
  Gunma: '群馬県',
  Saitama: '埼玉県',
  Chiba: '千葉県',
  Tokyo: '東京都',
  Kanagawa: '神奈川県',
  Niigata: '新潟県',
  Toyama: '富山県',
  Ishikawa: '石川県',
  Fukui: '福井県',
  Yamanashi: '山梨県',
  Nagano: '長野県',
  Gifu: '岐阜県',
  Shizuoka: '静岡県',
  Aichi: '愛知県',
  Mie: '三重県',
  Shiga: '滋賀県',
  Kyoto: '京都府',
  Osaka: '大阪府',
  Hyogo: '兵庫県',
  Nara: '奈良県',
  Wakayama: '和歌山県',
  Tottori: '鳥取県',
  Shimane: '島根県',
  Okayama: '岡山県',
  Hiroshima: '広島県',
  Yamaguchi: '山口県',
  Tokushima: '徳島県',
  Kagawa: '香川県',
  Ehime: '愛媛県',
  Kochi: '高知県',
  Fukuoka: '福岡県',
  Saga: '佐賀県',
  Nagasaki: '長崎県',
  Kumamoto: '熊本県',
  Oita: '大分県',
  Miyazaki: '宮崎県',
  Kagoshima: '鹿児島県',
  Okinawa: '沖縄県',
};

/** Japanese names for cities (key = prefecture, then city Romaji). */
export const CITY_JA: Record<string, Record<string, string>> = {
  [UNDECIDED]: { [UNDECIDED]: '未定' },
  Hokkaido: { Sapporo: '札幌市', Asahikawa: '旭川市', Hakodate: '函館市', Kushiro: '釧路市', Obihiro: '帯広市', Otaru: '小樽市', Kitami: '北見市', Ebetsu: '江別市', [OTHER]: 'その他' },
  Aomori: { Aomori: '青森市', Hachinohe: '八戸市', Hirosaki: '弘前市', Towada: '十和田市', Mutsu: 'むつ市', Goshogawara: '五所川原市', [OTHER]: 'その他' },
  Iwate: { Morioka: '盛岡市', Oshu: '奥州市', Ichinoseki: '一関市', Hanamaki: '花巻市', Kitakami: '北上市', Miyako: '宮古市', Kamaishi: '釜石市', [OTHER]: 'その他' },
  Miyagi: { Sendai: '仙台市', Ishinomaki: '石巻市', Osaki: '大崎市', Natori: '名取市', Shiogama: '塩竈市', Kesennuma: '気仙沼市', [OTHER]: 'その他' },
  Akita: { Akita: '秋田市', Yokote: '横手市', Yurihonjo: '由利本荘市', Oga: '男鹿市', Daisen: '大仙市', [OTHER]: 'その他' },
  Yamagata: { Yamagata: '山形市', Tsuruoka: '鶴岡市', Sagae: '寒河江市', Shinjo: '新庄市', Yonezawa: '米沢市', [OTHER]: 'その他' },
  Fukushima: { Fukushima: '福島市', Koriyama: '郡山市', Iwaki: 'いわき市', Aizuwakamatsu: '会津若松市', Sukagawa: '須賀川市', [OTHER]: 'その他' },
  Ibaraki: { Mito: '水戸市', Hitachi: '日立市', Tsukuba: 'つくば市', Hitachinaka: 'ひたちなか市', Koga: '古河市', Kasama: '笠間市', [OTHER]: 'その他' },
  Tochigi: { Utsunomiya: '宇都宮市', Ashikaga: '足利市', Tochigi: '栃木市', Oyama: '小山市', Kanuma: '鹿沼市', [OTHER]: 'その他' },
  Gunma: { Maebashi: '前橋市', Takasaki: '高崎市', Kiryu: '桐生市', Isesaki: '伊勢崎市', Ota: '太田市', Numata: '沼田市', [OTHER]: 'その他' },
  Saitama: { Saitama: 'さいたま市', Kawagoe: '川越市', Kawaguchi: '川口市', Tokorozawa: '所沢市', Koshigaya: '越谷市', Soka: '草加市', [OTHER]: 'その他' },
  Chiba: { Chiba: '千葉市', Funabashi: '船橋市', Matsudo: '松戸市', Ichikawa: '市川市', Kashiwa: '柏市', Narashino: '習志野市', [OTHER]: 'その他' },
  Tokyo: { Shinjuku: '新宿区', Shibuya: '渋谷区', Minato: '港区', Chiyoda: '千代田区', Chuo: '中央区', Taito: '台東区', Sumida: '墨田区', Koto: '江東区', Shinagawa: '品川区', Meguro: '目黒区', Ota: '大田区', Setagaya: '世田谷区', Nakano: '中野区', Suginami: '杉並区', Toshima: '豊島区', Kita: '北区', Arakawa: '荒川区', Itabashi: '板橋区', Nerima: '練馬区', Adachi: '足立区', Katsushika: '葛飾区', Edogawa: '江戸川区', [OTHER]: 'その他' },
  Kanagawa: { Yokohama: '横浜市', Kawasaki: '川崎市', Sagamihara: '相模原市', Fujisawa: '藤沢市', Hiratsuka: '平塚市', Kamakura: '鎌倉市', [OTHER]: 'その他' },
  Niigata: { Niigata: '新潟市', Nagaoka: '長岡市', Joetsu: '上越市', Sanjo: '三条市', Kashiwazaki: '柏崎市', Shibata: '新発田市', [OTHER]: 'その他' },
  Toyama: { Toyama: '富山市', Takaoka: '高岡市', Uozu: '魚津市', Namerikawa: '滑川市', [OTHER]: 'その他' },
  Ishikawa: { Kanazawa: '金沢市', Hakusan: '白山市', Komatsu: '小松市', Kaga: '加賀市', Nonoichi: '野々市市', [OTHER]: 'その他' },
  Fukui: { Fukui: '福井市', Tsuruga: '敦賀市', Obama: '小浜市', Echizen: '越前市', Sabae: '鯖江市', [OTHER]: 'その他' },
  Yamanashi: { Kofu: '甲府市', Fujiyoshida: '富士吉田市', Tsuru: '都留市', Nirasaki: '韮崎市', [OTHER]: 'その他' },
  Nagano: { Nagano: '長野市', Matsumoto: '松本市', Okaya: '岡谷市', Iida: '飯田市', Ina: '伊那市', Suzaka: '須坂市', [OTHER]: 'その他' },
  Gifu: { Gifu: '岐阜市', Ogaki: '大垣市', Takayama: '高山市', Tajimi: '多治見市', Seki: '関市', Mino: '美濃市', [OTHER]: 'その他' },
  Shizuoka: { Shizuoka: '静岡市', Hamamatsu: '浜松市', Numazu: '沼津市', Fuji: '富士市', Mishima: '三島市', Ito: '伊東市', [OTHER]: 'その他' },
  Aichi: { Nagoya: '名古屋市', Toyota: '豊田市', Okazaki: '岡崎市', Ichinomiya: '一宮市', Kasugai: '春日井市', Anjo: '安城市', [OTHER]: 'その他' },
  Mie: { Tsu: '津市', Yokkaichi: '四日市市', Ise: '伊勢市', Matsusaka: '松阪市', Kuwana: '桑名市', Suzuka: '鈴鹿市', [OTHER]: 'その他' },
  Shiga: { Otsu: '大津市', Kusatsu: '草津市', Hikone: '彦根市', Nagahama: '長浜市', Omihachiman: '近江八幡市', Koka: '甲賀市', [OTHER]: 'その他' },
  Kyoto: { Kyoto: '京都市', Uji: '宇治市', Maizuru: '舞鶴市', Kameoka: '亀岡市', Muko: '向日市', Nagaokakyo: '長岡京市', [OTHER]: 'その他' },
  Osaka: { Osaka: '大阪市', Sakai: '堺市', Higashiosaka: '東大阪市', Hirakata: '枚方市', Toyonaka: '豊中市', Suita: '吹田市', [OTHER]: 'その他' },
  Hyogo: { Kobe: '神戸市', Himeji: '姫路市', Nishinomiya: '西宮市', Amagasaki: '尼崎市', Akashi: '明石市', Kakogawa: '加古川市', [OTHER]: 'その他' },
  Nara: { Nara: '奈良市', Kashihara: '橿原市', Yamatotakada: '大和高田市', Tenri: '天理市', Ikoma: '生駒市', Yamatokoriyama: '大和郡山市', [OTHER]: 'その他' },
  Wakayama: { Wakayama: '和歌山市', Kainan: '海南市', Hashimoto: '橋本市', Tanabe: '田辺市', Gobo: '御坊市', [OTHER]: 'その他' },
  Tottori: { Tottori: '鳥取市', Yonago: '米子市', Sakaiminato: '境港市', Kurayoshi: '倉吉市', [OTHER]: 'その他' },
  Shimane: { Matsue: '松江市', Izumo: '出雲市', Masuda: '益田市', Hamada: '浜田市', Oda: '大田市', [OTHER]: 'その他' },
  Okayama: { Okayama: '岡山市', Kurashiki: '倉敷市', Tsuyama: '津山市', Tamano: '玉野市', Kasaoka: '笠岡市', [OTHER]: 'その他' },
  Hiroshima: { Hiroshima: '広島市', Fukuyama: '福山市', Kure: '呉市', Higashihiroshima: '東広島市', Onomichi: '尾道市', Hatsukaichi: '廿日市市', [OTHER]: 'その他' },
  Yamaguchi: { Shimonoseki: '下関市', Ube: '宇部市', Yamaguchi: '山口市', Hofu: '防府市', Iwakuni: '岩国市', Hikari: '光市', [OTHER]: 'その他' },
  Tokushima: { Tokushima: '徳島市', Naruto: '鳴門市', Anan: '阿南市', Komatsushima: '小松島市', [OTHER]: 'その他' },
  Kagawa: { Takamatsu: '高松市', Marugame: '丸亀市', Sakaide: '坂出市', Higashikagawa: '東かがわ市', [OTHER]: 'その他' },
  Ehime: { Matsuyama: '松山市', Niihama: '新居浜市', Imabari: '今治市', Saijo: '西条市', Ozu: '大洲市', [OTHER]: 'その他' },
  Kochi: { Kochi: '高知市', Sukumo: '宿毛市', Shimanto: '四万十市', Nankoku: '南国市', [OTHER]: 'その他' },
  Fukuoka: { Fukuoka: '福岡市', Kitakyushu: '北九州市', Omuta: '大牟田市', Kurume: '久留米市', Iizuka: '飯塚市', Chikushino: '筑紫野市', [OTHER]: 'その他' },
  Saga: { Saga: '佐賀市', Karatsu: '唐津市', Tosu: '鳥栖市', Imari: '伊万里市', Takeo: '武雄市', [OTHER]: 'その他' },
  Nagasaki: { Nagasaki: '長崎市', Sasebo: '佐世保市', Isahaya: '諫早市', Omura: '大村市', Shimabara: '島原市', [OTHER]: 'その他' },
  Kumamoto: { Kumamoto: '熊本市', Hitoyoshi: '人吉市', Arao: '荒尾市', Tamana: '玉名市', Yatsushiro: '八代市', [OTHER]: 'その他' },
  Oita: { Oita: '大分市', Beppu: '別府市', Nakatsu: '中津市', Saiki: '佐伯市', Usuki: '臼杵市', [OTHER]: 'その他' },
  Miyazaki: { Miyazaki: '宮崎市', Miyakonojo: '都城市', Nobeoka: '延岡市', Hyuga: '日向市', Nichinan: '日南市', [OTHER]: 'その他' },
  Kagoshima: { Kagoshima: '鹿児島市', Kirishima: '霧島市', Kanoya: '鹿屋市', Satsumasendai: '薩摩川内市', Makurazaki: '枕崎市', [OTHER]: 'その他' },
  Okinawa: { Naha: '那覇市', Okinawa: '沖縄市', Urasoe: '浦添市', Nago: '名護市', Ginowan: '宜野湾市', Ishigaki: '石垣市', Nanjō: '南城市', [OTHER]: 'その他' },
};

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

export function getDisplayLocation(prefecture: string | null | undefined, city: string | null | undefined): string;
export function getDisplayLocation(prefecture: string | null | undefined, city: string | null | undefined, lang: string): string;
export function getDisplayLocation(prefecture: string | null | undefined, city: string | null | undefined, lang?: string): string {
  const p = prefecture?.trim() || UNDECIDED;
  const c = city?.trim() || UNDECIDED;
  if (p === UNDECIDED && c === UNDECIDED) return lang === 'ja' ? '未定' : UNDECIDED;
  const pLabel = getPrefectureDisplayName(p, lang);
  const cLabel = getCityDisplayName(c, p, lang);
  return `${pLabel}, ${cLabel}`;
}

export function getPrefectureDisplayName(prefecture: string, lang?: string): string {
  if (lang === 'ja' && PREFECTURE_JA[prefecture]) return PREFECTURE_JA[prefecture];
  return prefecture;
}

export function getCityDisplayName(city: string, prefecture: string, lang?: string): string {
  if (lang === 'ja' && prefecture && CITY_JA[prefecture]?.[city]) return CITY_JA[prefecture][city];
  return city;
}
