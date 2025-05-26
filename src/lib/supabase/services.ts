import {
  SupabaseBuckets,
  SupabaseTables,
  type AyatAndHadith,
  type MasjidProfile,
  type Announcement,
  type Event,
  type Post,
  type PrayerTimes,
} from '@/types';
import type {
  AyatAndHadithData,
  MasjidProfileData,
  AnnouncementData,
  EventData,
  PostData,
  PrayerTimingsData,
} from '../zod';
import {
  getCurrentUser,
  uploadFile,
  fetchByColumn,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
} from './helpers';
import { generateMasjidCode } from '@/utils';

// Get masjid profile for current user
export async function getMasjidProfile(): Promise<MasjidProfile | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const profiles = await fetchByColumn<MasjidProfile>(
    SupabaseTables.MasjidProfiles,
    'user_id',
    user.id
  );
  return profiles.length > 0 ? profiles[0] : null;
}

// Create or update masjid profile
export async function upsertMasjidProfile(
  profileData: MasjidProfileData,
  logoFile: File | null,
  shouldRemoveLogo: boolean = false
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  let logoUrl = undefined;

  // Upload logo if provided
  if (logoFile) {
    logoUrl = await uploadFile(SupabaseBuckets.MasjidLogos, logoFile, `${user.id}-${Date.now()}`);
  }

  // Check if profile exists
  const profiles = await fetchByColumn<MasjidProfile>(
    SupabaseTables.MasjidProfiles,
    'user_id',
    user.id
  );
  const existingProfile = profiles.length > 0 ? profiles[0] : null;

  const profileToUpsert: Partial<MasjidProfile> = {
    ...profileData,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    latitude: profileData.latitude || null,
    longitude: profileData.longitude || null,
    name: profileData.name,
    code: existingProfile?.code || generateMasjidCode(),
  };

  if (logoUrl) profileToUpsert.logo_url = logoUrl;
  else if (shouldRemoveLogo) profileToUpsert.logo_url = '';

  if (existingProfile) {
    return await updateRecord<MasjidProfile>(
      SupabaseTables.MasjidProfiles,
      existingProfile.id as string,
      profileToUpsert
    );
  } else {
    profileToUpsert.created_at = new Date().toISOString();
    return await insertRecord<MasjidProfile>(SupabaseTables.MasjidProfiles, profileToUpsert);
  }
}

export async function getAyatAndHadith(): Promise<AyatAndHadith[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<AyatAndHadith>(SupabaseTables.AyatAndHadith, conditions);
}

export async function upsertAyatAndHadith(ayatAndHadith: AyatAndHadithData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const ayatAndHadithToUpsert: Partial<AyatAndHadith> = {
    ...ayatAndHadith,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (ayatAndHadith.id) {
    return await updateRecord<AyatAndHadith>(
      SupabaseTables.AyatAndHadith,
      ayatAndHadith.id,
      ayatAndHadithToUpsert
    );
  } else {
    ayatAndHadithToUpsert.created_at = new Date().toISOString();
    ayatAndHadithToUpsert.visible = true;
    return await insertRecord<AyatAndHadith>(SupabaseTables.AyatAndHadith, ayatAndHadithToUpsert);
  }
}

export async function deleteAyatAndHadith(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<AyatAndHadith>(SupabaseTables.AyatAndHadith, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to delete this item');

  const updates: Partial<AyatAndHadith> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<AyatAndHadith>(SupabaseTables.AyatAndHadith, id, updates);
  return true;
}

export async function toggleAyatAndHadithVisibility(
  id: string,
  visible: boolean
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<AyatAndHadith>(SupabaseTables.AyatAndHadith, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to update this item');

  const updates: Partial<AyatAndHadith> = { visible, updated_at: new Date().toISOString() };

  await updateRecord<AyatAndHadith>(SupabaseTables.AyatAndHadith, id, updates);
  return true;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<Announcement>(SupabaseTables.Announcements, conditions);
}

export async function upsertAnnouncement(announcement: AnnouncementData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const announcementToUpsert: Partial<Announcement> = {
    ...announcement,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (announcement.id) {
    return await updateRecord<Announcement>(
      SupabaseTables.Announcements,
      announcement.id,
      announcementToUpsert
    );
  } else {
    announcementToUpsert.created_at = new Date().toISOString();
    announcementToUpsert.visible = true;
    return await insertRecord<Announcement>(SupabaseTables.Announcements, announcementToUpsert);
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Announcement>(SupabaseTables.Announcements, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to delete this item');

  const updates: Partial<Announcement> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<Announcement>(SupabaseTables.Announcements, id, updates);
  return true;
}

export async function toggleAnnouncementVisibility(id: string, visible: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Announcement>(SupabaseTables.Announcements, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to update this item');

  const updates: Partial<Announcement> = { visible, updated_at: new Date().toISOString() };

  await updateRecord<Announcement>(SupabaseTables.Announcements, id, updates);
  return true;
}

export async function getEvents(): Promise<Event[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<Event>(SupabaseTables.Events, conditions);
}

export async function upsertEvent(event: EventData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const eventToUpsert: Partial<Event> = {
    ...event,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (event.id) {
    return await updateRecord<Event>(SupabaseTables.Events, event.id, eventToUpsert);
  } else {
    eventToUpsert.created_at = new Date().toISOString();
    eventToUpsert.visible = true;
    return await insertRecord<Event>(SupabaseTables.Events, eventToUpsert);
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Event>(SupabaseTables.Events, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to delete this item');

  const updates: Partial<Event> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<Event>(SupabaseTables.Events, id, updates);
  return true;
}

export async function toggleEventVisibility(id: string, visible: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Event>(SupabaseTables.Events, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to update this item');

  const updates: Partial<Event> = { visible, updated_at: new Date().toISOString() };

  await updateRecord<Event>(SupabaseTables.Events, id, updates);
  return true;
}

export async function getPosts(): Promise<Post[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<Post>(SupabaseTables.Posts, conditions);
}

export async function upsertPost(post: PostData & { id?: string }, imageFile: File | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  let imageUrl = undefined;

  // Upload image if provided
  if (imageFile) {
    imageUrl = await uploadFile(SupabaseBuckets.MasjidPosts, imageFile, `${user.id}-${Date.now()}`);
  }

  const postToUpsert: Partial<Post> = {
    ...post,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
    ...(imageUrl && { image_url: imageUrl }),
  };

  if (post.id) {
    return await updateRecord<Post>(SupabaseTables.Posts, post.id, postToUpsert);
  } else {
    postToUpsert.created_at = new Date().toISOString();
    postToUpsert.visible = true;
    return await insertRecord<Post>(SupabaseTables.Posts, postToUpsert);
  }
}

export async function deletePost(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Post>(SupabaseTables.Posts, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to delete this item');

  const updates: Partial<Post> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<Post>(SupabaseTables.Posts, id, updates);
  return true;
}

export async function togglePostVisibility(id: string, visible: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Post>(SupabaseTables.Posts, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to update this item');

  const updates: Partial<Post> = { visible, updated_at: new Date().toISOString() };

  await updateRecord<Post>(SupabaseTables.Posts, id, updates);
  return true;
}

export async function getPrayerTimeSettings(): Promise<PrayerTimes | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const prayerTimes = await fetchByColumn<PrayerTimes>(
    SupabaseTables.PrayerTimes,
    'user_id',
    user.id
  );
  return prayerTimes.length > 0 ? prayerTimes[0] : null;
}

export async function savePrayerTimeSettings(settings: PrayerTimingsData): Promise<PrayerTimes> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const existingSettings = await getPrayerTimeSettings();

  const settingsToUpsert: Partial<PrayerTimes> = {
    ...settings,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (existingSettings) {
    return await updateRecord<PrayerTimes>(
      SupabaseTables.PrayerTimes,
      existingSettings.id as string,
      settingsToUpsert
    );
  } else {
    settingsToUpsert.created_at = new Date().toISOString();
    return await insertRecord<PrayerTimes>(SupabaseTables.PrayerTimes, settingsToUpsert);
  }
}
