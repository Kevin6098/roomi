/** Common SNS/platforms for listing items */
export const LISTING_PLATFORMS = [
  'Facebook',
  'Jimoty',
  'Mercari',
  'Rednote',
  'WeChat',
  'LINE',
  'Instagram',
  'Other',
] as const;

export type ListingPlatform = (typeof LISTING_PLATFORMS)[number];
