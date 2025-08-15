import { SupabaseTables, type Settings, type Module, Theme } from '@/types';
import { HijriCalculationMethod } from '@/constants';
import {
  getCurrentUser,
  insertRecord,
  fetchByColumn,
  updateRecord,
  sortByDisplayOrderOrCreatedAt,
} from '../helpers';

/**
 * Gets user settings including modules configuration
 * @param userId Optional user ID, if not provided uses current authenticated user
 * @returns Promise resolving to settings object or null if not found
 */
export async function getSettings(userId?: string): Promise<Settings | null> {
  try {
    const user = userId ? { id: userId } : await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const results = await fetchByColumn<Settings>(SupabaseTables.Settings, 'user_id', user.id);

    if (results.length > 0) {
      const settings = results[0];
      settings.modules = sortByDisplayOrderOrCreatedAt(settings.modules);
      return settings;
    }

    return null;
  } catch (error) {
    console.error('Error in fetchSettings:', error);
    return null;
  }
}

export async function createDefaultSettings(): Promise<Settings> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const defaultModules: Module[] = [
    { id: 'ayat-and-hadith', name: 'Ayats & Hadiths', enabled: true, display_order: 1 },
    { id: 'announcements', name: 'Announcements', enabled: true, display_order: 2 },
    { id: 'events', name: 'Events', enabled: true, display_order: 3 },
    { id: 'posts', name: 'Posts', enabled: true, display_order: 4 },
  ];

  const settingsData: Partial<Settings> = {
    user_id: user.id,
    modules: defaultModules,
    theme: Theme.Theme1,
    hijri_calculation_method: HijriCalculationMethod.Umm_al_Qura,
    hijri_offset: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    return await insertRecord<Settings>(SupabaseTables.Settings, settingsData);
  } catch (error) {
    console.error('Error creating default settings:', error);
    throw error;
  }
}

export async function updateSettings(modules: Module[], theme?: Theme): Promise<Settings> {
  const settings = await getOrCreateSettings();
  if (!settings) throw new Error('Failed to get or create settings');

  try {
    const updatedSettings = await updateRecord<Settings>(SupabaseTables.Settings, settings.id, {
      modules,
      theme: theme !== undefined ? theme : settings.theme,
      updated_at: new Date().toISOString(),
    });

    // Sort modules by order in the returned result
    updatedSettings.modules = sortByDisplayOrderOrCreatedAt(updatedSettings.modules);
    return updatedSettings;
  } catch (error) {
    console.error('Error in updateSettings:', error);
    throw error;
  }
}

export async function updateTheme(theme: Theme): Promise<Settings> {
  const settings = await getOrCreateSettings();
  if (!settings) throw new Error('Failed to get or create settings');

  try {
    const updatedSettings = await updateRecord<Settings>(SupabaseTables.Settings, settings.id, {
      theme,
      updated_at: new Date().toISOString(),
    });
    updatedSettings.modules = sortByDisplayOrderOrCreatedAt(updatedSettings.modules);
    return updatedSettings;
  } catch (error) {
    console.error('Error in updateTheme:', error);
    throw error;
  }
}

export async function updateHijriSettings(
  method: HijriCalculationMethod,
  offset: number
): Promise<Settings> {
  const settings = await getOrCreateSettings();
  if (!settings) throw new Error('Failed to get or create settings');

  try {
    console.log('Updating hijri settings:', method, offset);
    const updatedSettings = await updateRecord<Settings>(SupabaseTables.Settings, settings.id, {
      hijri_calculation_method: method,
      hijri_offset: offset,
      updated_at: new Date().toISOString(),
    });
    updatedSettings.modules = sortByDisplayOrderOrCreatedAt(updatedSettings.modules);
    return updatedSettings;
  } catch (error) {
    console.error('Error in updateHijriSettings:', error);
    throw error;
  }
}

export async function getOrCreateSettings(): Promise<Settings | null> {
  const settings = await getSettings();
  if (!settings) return await createDefaultSettings();
  return settings;
}
