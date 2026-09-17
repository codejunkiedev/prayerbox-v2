import { z } from 'zod';
// Deep import: the `@/utils` barrel imports MAX_FILE_SIZE back out of this file.
import { isSupportedTimeZone } from '@/utils/timezone';

export const registerFormSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const loginWithCodeSchema = z.object({
  code: z.string().min(1, 'Screen code is required'),
});

export type LoginWithCodeData = z.infer<typeof loginWithCodeSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(8, 'Password must be at least 8 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;

export const changeEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ChangeEmailData = z.infer<typeof changeEmailSchema>;

/** Digits with optional country code and common separators, e.g. +92 300 1234567. */
const CONTACT_NUMBER_REGEX = /^\+?[\d\s()-]{7,20}$/;
/** Domain with an optional scheme and path, e.g. masjid.org or https://masjid.org/about. */
const WEBSITE_REGEX = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;

export const masjidProfileSchema = z.object({
  name: z.string().min(1, 'Masjid name is required'),
  name_ur: z.string(),
  name_ar: z.string(),
  area: z.string().min(1, 'Area is required'),
  area_ur: z.string(),
  area_ar: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .refine(isSupportedTimeZone, { message: 'Please select a valid timezone' }),
  contact_number: z.string().refine(value => value === '' || CONTACT_NUMBER_REGEX.test(value), {
    message: 'Please enter a valid contact number',
  }),
  contact_email: z
    .string()
    .refine(value => value === '' || z.string().email().safeParse(value).success, {
      message: 'Please enter a valid email address',
    }),
  website: z.string().refine(value => value === '' || WEBSITE_REGEX.test(value), {
    message: 'Please enter a valid website address',
  }),
});

export type MasjidProfileData = z.infer<typeof masjidProfileSchema>;

export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
/** File extensions surfaced when listing stored background images. */
export const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const announcementSchema = z.object({
  description: z.string().min(1, 'Description is required'),
});

export type AnnouncementData = z.infer<typeof announcementSchema>;

export const eventSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    date_time: z.string().min(1, 'Date and time is required'),
    end_time: z.string().nullable(),
    location: z.string().min(1, 'Location is required'),
    chief_guest: z.string().min(1, 'Chief guest is required'),
    host: z.string().optional(),
    qari: z.string().min(1, 'Qari is required'),
    naat_khawn: z.string().min(1, 'Naat khawn is required'),
    karm_farma: z.string().min(1, 'Karm farm is required'),
  })
  .refine(data => !data.end_time || new Date(data.end_time) > new Date(data.date_time), {
    message: 'End time must be after the start time',
    path: ['end_time'],
  });

export type EventData = z.infer<typeof eventSchema>;

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  orientation: z.enum(['landscape', 'portrait']),
});

export type PostData = z.infer<typeof postSchema>;

export const youtubeVideoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  youtube_url: z
    .string()
    .min(1, 'YouTube URL is required')
    .refine(
      url => {
        const pattern =
          /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/;
        return pattern.test(url);
      },
      { message: 'Please enter a valid YouTube URL' }
    ),
  loop_video: z.boolean(),
});

export type YouTubeVideoData = z.infer<typeof youtubeVideoSchema>;

export const singleAdjustmentSchema = z.object({
  type: z.enum(['offset', 'manual', 'default']),
  offset: z.number().optional(),
  manual_time: z.string().optional(),
});

export type SingleAdjustmentData = z.infer<typeof singleAdjustmentSchema>;

export const prayerAdjustmentSchema = z.object({
  starts: singleAdjustmentSchema,
  athan: singleAdjustmentSchema,
  iqamah: singleAdjustmentSchema,
});

export type PrayerAdjustmentData = z.infer<typeof prayerAdjustmentSchema>;

export const prayerAdjustmentsFormSchema = z.object({
  prayer_adjustments: z
    .object({
      fajr: prayerAdjustmentSchema,
      dhuhr: prayerAdjustmentSchema,
      asr: prayerAdjustmentSchema,
      maghrib: prayerAdjustmentSchema,
      isha: prayerAdjustmentSchema,
      jumma1: prayerAdjustmentSchema,
      jumma2: prayerAdjustmentSchema,
      jumma3: prayerAdjustmentSchema,
    })
    .optional(),
});

export type PrayerAdjustmentsFormData = z.infer<typeof prayerAdjustmentsFormSchema>;

export const solarAdjustmentsSchema = z.object({
  sunrise_adjustment: singleAdjustmentSchema,
  sunset_adjustment: singleAdjustmentSchema,
  ishraq_adjustment: singleAdjustmentSchema,
  chasht_adjustment: singleAdjustmentSchema,
});

export type SolarAdjustmentsData = z.infer<typeof solarAdjustmentsSchema>;

export const screenSchema = z.object({
  name: z.string().min(1, 'Screen name is required'),
  orientation: z.enum(['landscape', 'portrait']),
  show_prayer_times: z.boolean(),
  show_weather: z.boolean(),
  language: z.enum(['en', 'ur', 'ar']),
  slide_interval_seconds: z
    .number({ invalid_type_error: 'Slide interval is required' })
    .int('Slide interval must be a whole number')
    .min(5, 'Slide interval must be at least 5 seconds')
    .max(60, 'Slide interval must be at most 60 seconds'),
  // An empty list is the alert switched off, so there's nothing to require here.
  prayer_alert_triggers: z.array(z.enum(['athan', 'iqamah'])),
});

export type ScreenData = z.infer<typeof screenSchema>;

export const createModeratorSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type CreateModeratorData = z.infer<typeof createModeratorSchema>;

export const updateModeratorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
});

export type UpdateModeratorData = z.infer<typeof updateModeratorSchema>;

export const resetModeratorPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetModeratorPasswordData = z.infer<typeof resetModeratorPasswordSchema>;

const textStyleSchema = z.object({
  font_id: z.string(),
  size: z.number().min(8).max(300),
  color: z.string(),
  line_height: z.number().min(0.8).max(4),
});

const referenceStyleSchema = z.object({
  font_id: z.string(),
  arabic_font_id: z.string(),
  size: z.number().min(8).max(300),
  color: z.string(),
  line_height: z.number().min(0.8).max(4),
});

const backgroundSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('image'), url: z.string() }),
  z.object({ type: z.literal('color'), color: z.string() }),
  z.object({
    type: z.literal('gradient'),
    from: z.string(),
    to: z.string(),
    angle: z.number().min(0).max(360),
  }),
]);

const ayatHadithStyleSchema = z.object({
  background: backgroundSchema,
  overlay_color: z.string(),
  overlay_opacity: z.number().min(0).max(1),
  arabic: textStyleSchema,
  urdu: textStyleSchema,
  english: textStyleSchema,
  reference: referenceStyleSchema,
});

const ayatSourceSchema = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1),
});

const hadithSourceSchema = z.object({
  book: z.string().min(1),
  hadith_number: z.string().min(1),
});

const cachedTextSchema = z.object({
  arabic: z.string(),
  urdu: z.object({ edition: z.string(), text: z.string() }).optional(),
  english: z.object({ edition: z.string(), text: z.string() }).optional(),
  reference: z.object({ arabic: z.string(), english: z.string() }).optional(),
});

export const ayatAndHadithSchema = z.object({
  type: z.enum(['ayat', 'hadith']),
  orientation: z.enum(['landscape', 'portrait']),
  source: z.union([ayatSourceSchema, hadithSourceSchema]),
  cached_text: cachedTextSchema,
  style: ayatHadithStyleSchema,
});

export type AyatAndHadithData = z.infer<typeof ayatAndHadithSchema>;
