import { SupabaseTables, type YouTubeVideo } from '@/types';
import type { YouTubeVideoData } from '../../zod';
import {
  getCurrentUser,
  fetchByColumn,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
} from '../helpers';
import { removeScreenAssignments } from './screens';

export async function getYouTubeVideos(userId?: string): Promise<YouTubeVideo[]> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<YouTubeVideo>(SupabaseTables.YouTubeVideos, conditions);
}

export async function upsertYouTubeVideo(video: YouTubeVideoData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const record: Partial<YouTubeVideo> = {
    ...video,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (video.id) {
    return await updateRecord<YouTubeVideo>(SupabaseTables.YouTubeVideos, video.id, record);
  } else {
    record.created_at = new Date().toISOString();
    return await insertRecord<YouTubeVideo>(SupabaseTables.YouTubeVideos, record);
  }
}

export async function deleteYouTubeVideo(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<YouTubeVideo>(SupabaseTables.YouTubeVideos, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to delete this item');

  const updates: Partial<YouTubeVideo> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<YouTubeVideo>(SupabaseTables.YouTubeVideos, id, updates);
  await removeScreenAssignments(id);
  return true;
}
