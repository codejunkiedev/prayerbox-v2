import { registerSW } from 'virtual:pwa-register';
import { Sentry } from './sentry';

export function registerServiceWorker(): void {
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
