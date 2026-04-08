import type { MasjidMember } from '@/types';
import supabase from '../index';

export type ModeratorWithEmail = MasjidMember & { email: string };

async function handleError(error: Error | null, fallback: string): Promise<never> {
  // FunctionsHttpError stores the raw Response in error.context
  // We need to parse the JSON body to get the actual error message
  if (error && 'context' in error && error.context instanceof Response) {
    try {
      const body = await error.context.json();
      if (body?.error) throw new Error(body.error);
    } catch (e) {
      if (e instanceof Error && e.message !== error.message) throw e;
    }
  }
  throw new Error(error?.message || fallback);
}

export async function getModerators(): Promise<ModeratorWithEmail[]> {
  const { data, error } = await supabase.functions.invoke('get-moderators');

  if (error) await handleError(error, 'Failed to fetch moderators');
  if (data?.error) throw new Error(data.error);
  if (Array.isArray(data)) return data;
  return [];
}

export async function updateModerator(
  userId: string,
  updates: { name?: string; email?: string }
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('update-moderator', {
    body: { user_id: userId, ...updates },
  });

  if (error) await handleError(error, 'Failed to update moderator');
  if (data?.error) throw new Error(data.error);
}

export async function createModerator(
  email: string,
  password: string,
  name: string
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('create-moderator', {
    body: { email, password, name },
  });

  if (error) await handleError(error, 'Failed to create moderator');
  if (data?.error) throw new Error(data.error);
}

export async function resetModeratorPassword(userId: string, password: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('reset-moderator-password', {
    body: { user_id: userId, password },
  });

  if (error) await handleError(error, 'Failed to reset password');
  if (data?.error) throw new Error(data.error);
}

export async function revokeModerator(userId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('revoke-moderator', {
    body: { user_id: userId },
  });

  if (error) await handleError(error, 'Failed to revoke moderator');
  if (data?.error) throw new Error(data.error);
}
