import type { MasjidMember } from '@/types';
import supabase from '../index';

export type ModeratorWithEmail = MasjidMember & { email: string };

export async function getModerators(): Promise<ModeratorWithEmail[]> {
  const { data, error } = await supabase.functions.invoke('get-moderators');

  if (error) throw new Error(error.message || 'Failed to fetch moderators');
  if (Array.isArray(data)) return data;
  if (data?.error) throw new Error(data.error);
  return [];
}

export async function createModerator(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('create-moderator', {
    body: { email, password },
  });

  if (error) throw new Error(error.message || 'Failed to create moderator');
  if (data?.error) throw new Error(data.error);
}

export async function resetModeratorPassword(userId: string, password: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('reset-moderator-password', {
    body: { user_id: userId, password },
  });

  if (error) throw new Error(error.message || 'Failed to reset password');
  if (data?.error) throw new Error(data.error);
}

export async function revokeModerator(userId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('revoke-moderator', {
    body: { user_id: userId },
  });

  if (error) throw new Error(error.message || 'Failed to revoke moderator');
  if (data?.error) throw new Error(data.error);
}
