export type User = {
  id: number;
  createdAt: Date;
  emailAddress: string;
  passwordHash: string;
  accessToken?: string;
  name?: string;
}

export type PrayerCategory = {
  id: number;
  createdAt: Date;
  userId: number;
  name: string;
};

export enum PrayerPointStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export type PrayerPoint = {
  id: number;
  createdAt: Date;
  categoryId: string;
  content: string;
  status: PrayerPointStatus;
  lastTimePrayed?: Date;
};
