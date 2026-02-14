/**
 * Shared platform list for listing (where item is posted) and contact/customer (source platform).
 * Keeps UI and options consistent across the app.
 */
export const PLATFORM_OPTIONS = [
  'Facebook',
  'WeChat',
  'Xiaohongshu',
  'LINE',
  'Whatsapp',
  'Telegram',
  'Jimoty',
  'Mercari',
  'PayPayFlea',
  'Rakuma',
  'YahooAuction',
  'Rednote',
  'Instagram',
  'Other',
] as const;

export type PlatformOption = (typeof PLATFORM_OPTIONS)[number];
export const PLATFORM_OTHER = 'Other';
export const PLATFORM_OTHER_SENTINEL = '__other__';
