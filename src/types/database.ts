export type User = {
  id: number;
  createdAt: Date;
  emailAddress: string;
  passwordHash: string;
  salt: string;
  accessToken: string;
  name?: string;
}

export type PrayerCategory = {
  id: number;
  createdAt: Date;
  userId: number;
  name: string;
};

export enum PrayerPointStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export const PRAYER_TYPES = ['ask', 'thank', 'confess', 'praise'] as const;
export type PrayerType = typeof PRAYER_TYPES[number];

export const PRAYER_THEMES = ['personal', 'family', 'friends', 'church', 'work', 'school', 'health', 'world', 'other'] as const;
export type PrayerTheme = typeof PRAYER_THEMES[number];

export type PrayerPoint = {
  id: number;
  createdAt: Date;
  categoryId: string;
  content: string;
  status: PrayerPointStatus;
  prayerType?: PrayerType;
  prayerTheme?: PrayerTheme;
  lastTimePrayed?: Date;
};

export interface ProcessedPrayer {
  content: string;
  prayerType: PrayerType;
  prayerTheme: PrayerTheme;
}
