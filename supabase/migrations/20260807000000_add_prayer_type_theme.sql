-- Add orthogonal analytics metadata without changing the existing category relationships.
ALTER TABLE public."prayerPoints"
  ADD COLUMN IF NOT EXISTS "prayerType" TEXT,
  ADD COLUMN IF NOT EXISTS "prayerTheme" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prayer_points_prayer_type_check') THEN
    ALTER TABLE public."prayerPoints"
      ADD CONSTRAINT prayer_points_prayer_type_check
      CHECK ("prayerType" IS NULL OR "prayerType" IN ('ask', 'thank', 'confess', 'praise'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prayer_points_prayer_theme_check') THEN
    ALTER TABLE public."prayerPoints"
      ADD CONSTRAINT prayer_points_prayer_theme_check
      CHECK ("prayerTheme" IS NULL OR "prayerTheme" IN ('personal', 'family', 'friends', 'church', 'work', 'school', 'health', 'world', 'other'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS prayer_points_prayer_type_idx
  ON public."prayerPoints" ("prayerType");

CREATE INDEX IF NOT EXISTS prayer_points_prayer_theme_idx
  ON public."prayerPoints" ("prayerTheme");
