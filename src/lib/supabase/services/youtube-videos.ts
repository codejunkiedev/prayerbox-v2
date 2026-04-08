import { SupabaseTables, type YouTubeVideo } from '@/types';
import type { YouTubeVideoData } from '../../zod';
import {
  getCurrentUser,
  getMasjidMembership,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
} from '../helpers';
import { removeScreenAssignments } from './screens';

export async function getYouTubeVideos(masjidId?: string): Promise<YouTubeVideo[]> {
  const effectiveMasjidId = masjidId || (await getMasjidMembership()).masjid_id;

  const conditions = [
    { column: 'masjid_id', value: effectiveMasjidId },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<YouTubeVideo>(SupabaseTables.YouTubeVideos, conditions);
}

export async function upsertYouTubeVideo(video: YouTubeVideoData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const { masjid_id } = await getMasjidMembership();

  const record: Partial<YouTubeVideo> = {
    ...video,
    user_id: user.id,
    masjid_id,
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
  const updates: Partial<YouTubeVideo> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<YouTubeVideo>(SupabaseTables.YouTubeVideos, id, updates);
  await removeScreenAssignments(id);
  return true;
}
