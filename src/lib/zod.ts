import { z } from 'zod';

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

export const masjidProfileSchema = z.object({
  name: z.string().min(1, 'Masjid name is required'),
  area: z.string().min(1, 'Area is required'),
  latitude: z.number(),
  longitude: z.number(),
});

export type MasjidProfileData = z.infer<typeof masjidProfileSchema>;

export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ayatAndHadithSchema = z.object({
  text: z.string().min(1, 'text is required'),
  translation: z.string().min(1, 'translation is required'),
  reference: z.string().min(1, 'reference is required'),
  type: z.enum(['ayat', 'hadith']),
});

export type AyatAndHadithData = z.infer<typeof ayatAndHadithSchema>;

export const announcementSchema = z.object({
  description: z.string().min(1, 'Description is required'),
});

export type AnnouncementData = z.infer<typeof announcementSchema>;

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date_time: z.string().min(1, 'Date and time is required'),
  location: z.string().min(1, 'Location is required'),
  chief_guest: z.string().min(1, 'Chief guest is required'),
  host: z.string().optional(),
  qari: z.string().min(1, 'Qari is required'),
  naat_khawn: z.string().min(1, 'Naat khawn is required'),
  karm_farma: z.string().min(1, 'Karm farm is required'),
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
      sunrise: prayerAdjustmentSchema,
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

export const screenSchema = z.object({
  name: z.string().min(1, 'Screen name is required'),
  orientation: z.enum(['landscape', 'portrait', 'mobile']),
  show_prayer_times: z.boolean(),
  show_weather: z.boolean(),
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
