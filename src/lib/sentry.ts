import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  const environment = import.meta.env.MODE;
  const isProd = environment === 'production';

  Sentry.init({
    dsn,
    environment,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: isProd ? 0.1 : 1.0,
    tracePropagationTargets: [/^\/(?!\/)/, /^https:\/\/[^/]+\.supabase\.co\//],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

type CaptureContext = {
  operation: string;
  source: 'supabase.postgrest' | 'supabase.auth' | 'supabase.storage' | 'supabase.functions';
  extra?: Record<string, unknown>;
};

export function captureSupabaseError(error: unknown, context: CaptureContext): void {
  Sentry.withScope(scope => {
    scope.setTag('source', context.source);
    scope.setTag('operation', context.operation);
    if (context.extra) scope.setExtras(context.extra);
    Sentry.captureException(error);
  });
}

export { Sentry };
