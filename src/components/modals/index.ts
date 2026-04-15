import { lazy } from 'react';

export * from './sign-out-modal';
export * from './delete-confirmation-modal';
export * from './orientation-picker-modal';

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
export const ScreenModal = lazy(() =>
  import('./screen-modal').then(m => ({ default: m.ScreenModal }))
);
export const ScreenAssignmentModal = lazy(() =>
  import('./screen-assignment-modal').then(m => ({ default: m.ScreenAssignmentModal }))
);
export const YouTubeVideoModal = lazy(() =>
  import('./youtube-video-modal').then(m => ({ default: m.YouTubeVideoModal }))
);
