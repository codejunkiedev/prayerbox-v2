import { lazy } from 'react';

export * from './sign-out-modal';
export * from './delete-confirmation-modal';

export const AyatAndHadithModal = lazy(() => import('./ayat-and-hadith-modal'));
export const AnnouncementModal = lazy(() =>
  import('./announcement-modal').then(m => ({ default: m.AnnouncementModal }))
);
export const EventModal = lazy(() =>
  import('./event-modal').then(m => ({ default: m.EventModal }))
);
export const PostModal = lazy(() => import('./post-modal').then(m => ({ default: m.PostModal })));
export const MapModal = lazy(() => import('./map-modal').then(m => ({ default: m.MapModal })));
export const PrayerTimingsModal = lazy(() =>
  import('./prayer-timings-modal').then(m => ({ default: m.PrayerTimingsModal }))
);
