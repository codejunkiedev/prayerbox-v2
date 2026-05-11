import * as Sentry from '@sentry/react';
import type { Session } from '@supabase/supabase-js';
import type { MemberRole } from '@/types';

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

export function identifySentryUser(
  session: Session,
  masjidId: string | null,
  role: MemberRole | null
): void {
  Sentry.setUser({
    id: session.user.id,
    email: session.user.email,
    masjid_id: masjidId ?? undefined,
    role: role ?? undefined,
  });
}

export function clearSentryUser(): void {
  Sentry.setUser(null);
}

export { Sentry };
