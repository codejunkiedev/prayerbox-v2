import { lazy } from 'react';

export const Home = lazy(() => import('./home'));
export const ResetPassword = lazy(() => import('./reset-password'));
export const SettingsAccount = lazy(() => import('./settings/account'));
export const AyatAndHadith = lazy(() => import('./ayat-and-hadith'));
export const Announcements = lazy(() => import('./announcements'));
export const Events = lazy(() => import('./events'));
export const Posts = lazy(() => import('./posts'));
export const PrayerTimings = lazy(() => import('./prayer-timings'));
export const Settings = lazy(() => import('./settings'));

export const SettingsThemes = lazy(() => import('./settings/themes'));
export const SettingsHijri = lazy(() => import('./settings/hijri'));
export const SettingsProfile = lazy(() => import('./settings/profile'));
export const SettingsPrayerTimes = lazy(() => import('./settings/prayer-times'));
export const Screens = lazy(() => import('./screens'));
export const ScreenDetail = lazy(() => import('./screen-detail'));
export const Display = lazy(() => import('./display'));
export const DisplayLogout = lazy(() => import('./display-logout'));
export const YouTubeVideos = lazy(() => import('./youtube-videos'));
export const Moderators = lazy(() => import('./moderators'));
export const Support = lazy(() => import('./support'));
