import {
  SupabaseTables,
  type DisplayScreen,
  type ScreenContent,
  type ScreenContentType,
} from '@/types';
import type { ScreenData } from '../../zod';
import { getCurrentUser, fetchByColumn, updateRecord, insertRecord } from '../helpers';
import { generateScreenCode } from '@/utils';
import supabase from '../index';

export async function getScreens(): Promise<DisplayScreen[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  return await fetchByColumn<DisplayScreen>(SupabaseTables.DisplayScreens, 'user_id', user.id);
}

export async function getScreenByCode(code: string): Promise<DisplayScreen | null> {
  const screens = await fetchByColumn<DisplayScreen>(SupabaseTables.DisplayScreens, 'code', code);
  return screens.length > 0 ? screens[0] : null;
}

export async function createScreen(data: ScreenData): Promise<DisplayScreen> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const screenToInsert: Partial<DisplayScreen> = {
    ...data,
    user_id: user.id,
    code: generateScreenCode(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return await insertRecord<DisplayScreen>(SupabaseTables.DisplayScreens, screenToInsert);
}

export async function updateScreen(id: string, data: ScreenData): Promise<DisplayScreen> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const screens = await fetchByColumn<DisplayScreen>(SupabaseTables.DisplayScreens, 'id', id);
  if (screens.length === 0) throw new Error('Screen not found');
  if (screens[0].user_id !== user.id) throw new Error('Not authorized to update this screen');

  return await updateRecord<DisplayScreen>(SupabaseTables.DisplayScreens, id, {
    ...data,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteScreen(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const screens = await fetchByColumn<DisplayScreen>(SupabaseTables.DisplayScreens, 'id', id);
  if (screens.length === 0) throw new Error('Screen not found');
  if (screens[0].user_id !== user.id) throw new Error('Not authorized to delete this screen');

  const { error } = await supabase.from(SupabaseTables.DisplayScreens).delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function getScreenContent(screenId: string): Promise<ScreenContent[]> {
  return await fetchByColumn<ScreenContent>(SupabaseTables.ScreenContent, 'screen_id', screenId);
}

export async function getScreensForContent(
  contentId: string,
  contentType: ScreenContentType
): Promise<ScreenContent[]> {
  const { data, error } = await supabase
    .from(SupabaseTables.ScreenContent)
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType);

  if (error) throw error;
  return data as ScreenContent[];
}

export async function bulkUpdateScreenAssignments(
  contentId: string,
  contentType: ScreenContentType,
  screenIds: string[]
): Promise<void> {
  // Delete all existing assignments for this content item
  const { error: deleteError } = await supabase
    .from(SupabaseTables.ScreenContent)
    .delete()
    .eq('content_id', contentId)
    .eq('content_type', contentType);

  if (deleteError) throw deleteError;

  // Insert new assignments
  if (screenIds.length > 0) {
    const rows = screenIds.map(screenId => ({
      screen_id: screenId,
      content_id: contentId,
      content_type: contentType,
    }));

    const { error: insertError } = await supabase.from(SupabaseTables.ScreenContent).insert(rows);

    if (insertError) throw insertError;
  }
}
