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
  code: z.string().min(1, 'Masjid code is required'),
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

export const masjidProfileSchema = z.object({
  name: z.string().min(1, 'Masjid name is required'),
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
});

export type PostData = z.infer<typeof postSchema>;

export const prayerAdjustmentSchema = z.object({
  type: z.enum(['offset', 'manual', 'default']),
  offset: z.number().optional(),
  manual_time: z.string().optional(),
});

export type PrayerAdjustmentData = z.infer<typeof prayerAdjustmentSchema>;

export const prayerTimingsFormSchema = z.object({
  calculation_method: z.number(),
  juristic_school: z.number(),
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

export type PrayerTimingsData = z.infer<typeof prayerTimingsFormSchema>;
