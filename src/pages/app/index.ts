import { lazy } from 'react';

export const Home = lazy(() => import('./home'));
export const Profile = lazy(() => import('./profile'));
export const ResetPassword = lazy(() => import('./reset-password'));
export const UpdatePassword = lazy(() => import('./update-password'));
export const AyatAndHadith = lazy(() => import('./ayat-and-hadith'));
export const Announcements = lazy(() => import('./announcements'));
export const Events = lazy(() => import('./events'));
export const Posts = lazy(() => import('./posts'));
export const PrayerTimings = lazy(() => import('./prayer-timings'));
export const Settings = lazy(() => import('./settings'));
export const SettingsModules = lazy(() => import('./settings/modules'));
export const SettingsThemes = lazy(() => import('./settings/themes'));
export const SettingsHijri = lazy(() => import('./settings/hijri'));
export const Display = lazy(() => import('./display'));
