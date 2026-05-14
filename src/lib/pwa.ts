import { registerSW } from 'virtual:pwa-register';
import { AppRoutes, AuthRoutes } from '@/constants/routes';
import { Sentry } from './sentry';

const DISPLAY_PATHS = new Set<string>([
  AppRoutes.Display,
  AppRoutes.DisplayLogout,
  AuthRoutes.LoginWithCode,
]);

function isDisplayPath(pathname: string): boolean {
  return DISPLAY_PATHS.has(pathname);
}

export function registerServiceWorker(): void {
  if (!isDisplayPath(window.location.pathname)) {
    void unregisterServiceWorker();
    return;
  }

  registerSW({
    immediate: true,
    onRegisterError(error) {
      Sentry.withScope(scope => {
        scope.setTag('source', 'pwa');
        scope.setTag('operation', 'register_service_worker');
        Sentry.captureException(error);
      });
    },
  });
}

async function unregisterServiceWorker(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (error) {
    Sentry.withScope(scope => {
      scope.setTag('source', 'pwa');
      scope.setTag('operation', 'unregister_service_worker');
      Sentry.captureException(error);
    });
  }
}
