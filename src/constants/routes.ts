export enum AuthRoutes {
  Login = '/login',
  LoginWithCode = '/login-with-code',
  Register = '/register',
  ForgotPassword = '/forgot-password',
}

export enum AppRoutes {
  Display = '/',
  DisplayLogout = '/logout',
  Home = '/admin',
  ResetPassword = '/admin/reset-password',
  Announcements = '/admin/announcements',
  Events = '/admin/events',
  Posts = '/admin/posts',
  YouTubeVideos = '/admin/youtube-videos',
  PrayerTimings = '/admin/prayer-timings',
  Screens = '/admin/screens',
  ScreenDetail = '/admin/screens/:id',
  Settings = '/admin/settings',
  SettingsProfile = '/admin/settings/profile',

  SettingsThemes = '/admin/settings/themes',
  SettingsHijri = '/admin/settings/hijri-adjustment',
  SettingsAccount = '/admin/settings/account',
  SettingsPrayerTimes = '/admin/settings/prayer-times',
  Moderators = '/admin/moderators',
  Support = '/admin/support',
}
