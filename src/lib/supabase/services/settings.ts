import { SupabaseTables, type Settings, type Module } from '@/types';
import { getCurrentUser, insertRecord, fetchByColumn, updateRecord } from '../helpers';

export async function fetchSettings(): Promise<Settings | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const results = await fetchByColumn<Settings>(SupabaseTables.Settings, 'user_id', user.id);

    if (results.length > 0) {
      const settings = results[0];
      settings.modules = sortModulesByOrder(settings.modules);
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
    { id: '1', name: 'Ayats & Hadiths', enabled: true, display_order: 1 },
    { id: '2', name: 'Announcements', enabled: true, display_order: 2 },
    { id: '3', name: 'Events', enabled: true, display_order: 3 },
    { id: '4', name: 'Posts', enabled: true, display_order: 4 },
  ];

  const settingsData: Partial<Settings> = {
    user_id: user.id,
    modules: defaultModules,
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

export async function updateSettings(modules: Module[]): Promise<Settings> {
  const settings = await getOrCreateSettings();
  if (!settings) throw new Error('Failed to get or create settings');

  try {
    const updatedSettings = await updateRecord<Settings>(SupabaseTables.Settings, settings.id, {
      modules,
      updated_at: new Date().toISOString(),
    });

    // Sort modules by order in the returned result
    updatedSettings.modules = sortModulesByOrder(updatedSettings.modules);
    return updatedSettings;
  } catch (error) {
    console.error('Error in updateSettings:', error);
    throw error;
  }
}

export async function getOrCreateSettings(): Promise<Settings | null> {
  const settings = await fetchSettings();
  if (!settings) return await createDefaultSettings();
  return settings;
}

function sortModulesByOrder(modules: Module[]): Module[] {
  return [...modules].sort((a, b) => {
    if (a.display_order !== undefined && b.display_order !== undefined) {
      return a.display_order - b.display_order;
    }
    return 0;
  });
}
