import { SupabaseBuckets, SupabaseTables, type Post } from '@/types';
import type { PostData } from '../../zod';
import {
  getCurrentUser,
  fetchByColumn,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
  uploadFile,
  updateRecordsOrder,
  sortByDisplayOrderOrCreatedAt,
  getMaxOrderValue,
} from '../helpers';

export async function getPosts(userId?: string): Promise<Post[]> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
    ...(userId ? [{ column: 'visible', value: true }] : []),
  ];

  const items = await fetchByMultipleConditions<Post>(SupabaseTables.Posts, conditions);

  return sortByDisplayOrderOrCreatedAt(items);
}

export async function upsertPost(post: PostData & { id?: string }, imageFile: File | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  let imageUrl = undefined;

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

    const allItems = await getPosts();
    postToUpsert.display_order = getMaxOrderValue(allItems) + 1;

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

export async function updatePostsOrder(
  items: Array<{ id: string; display_order: number }>
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const itemIds = items.map(item => item.id);
  const conditions = [{ column: 'id', value: itemIds[0] }];

  for (let i = 1; i < itemIds.length; i++) {
    conditions.push({ column: 'id', value: itemIds[i] });
  }

  const existingItems = await fetchByMultipleConditions<Post>(SupabaseTables.Posts, conditions);

  const unauthorized = existingItems.some(item => item.user_id !== user.id);
  if (unauthorized) {
    throw new Error('Not authorized to update one or more items');
  }

  return await updateRecordsOrder(SupabaseTables.Posts, items, user.id);
}
