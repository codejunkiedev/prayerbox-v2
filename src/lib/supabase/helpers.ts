import { AppRoutes } from '@/constants';
import supabase from './index';
import { PostgrestError, type Session } from '@supabase/supabase-js';

/**
 * Helper to subscribe to auth changes
 * @param callback The callback to call when the auth state changes
 * @returns The subscription object
 */
export const subscribeToAuthChanges = (callback: (session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
};

/**
 * Helper to get the current session
 * @returns The current session or null if not authenticated
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return data.session;
}

/**
 * Helper to check if a user is authenticated
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return data.user;
}

/**
 * Helper to handle common Supabase errors
 * @param error The PostgrestError to handle
 * @param customMessage Optional custom error message
 */
export function handleSupabaseError(error: PostgrestError, customMessage?: string): Error {
  console.error(customMessage || 'Supabase error:', error);

  // Handle specific error codes
  if (error.code === 'PGRST116') {
    return new Error('No data found');
  }

  if (error.code === '23505') {
    return new Error('This record already exists');
  }

  if (error.code === '42P01') {
    return new Error('The requested resource does not exist');
  }

  return new Error(error.message || 'An unknown error occurred');
}

/**
 * Helper to simplify data fetching from a table
 * @param table The table name to query
 * @param columns The columns to select, defaults to '*'
 * @returns The fetched data
 */
export async function fetchFromTable<T>(table: string, columns: string = '*'): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(columns);

  if (error) {
    throw handleSupabaseError(error, `Error fetching data from ${table}`);
  }

  return data as T[];
}

/**
 * Helper to fetch a single record by ID
 * @param table The table name to query
 * @param id The ID of the record to fetch
 * @param columns The columns to select, defaults to '*'
 * @returns The fetched record or null if not found
 */
export async function fetchById<T>(
  table: string,
  id: string,
  columns: string = '*'
): Promise<T | null> {
  const { data, error } = await supabase.from(table).select(columns).eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw handleSupabaseError(error, `Error fetching record from ${table}`);
  }

  return data as T;
}

/**
 * Helper to fetch records by a column value
 * @param table The table name to query
 * @param column The column to filter on
 * @param value The value to match
 * @param columns The columns to select, defaults to '*'
 * @returns The fetched records
 */
export async function fetchByColumn<T>(
  table: string,
  column: string,
  value: string | number | boolean,
  columns: string = '*'
): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(columns).eq(column, value);

  if (error) {
    throw handleSupabaseError(error, `Error fetching records from ${table}`);
  }

  return data as T[];
}

/**
 * Helper to fetch records by multiple column conditions
 * @param table The table name to query
 * @param conditions Array of conditions with column, value, and optional isNull flag
 * @param columns The columns to select, defaults to '*'
 * @returns The fetched records
 */
export async function fetchByMultipleConditions<T>(
  table: string,
  conditions: Array<{ column: string; value?: string | number | boolean; isNull?: boolean }>,
  columns: string = '*'
): Promise<T[]> {
  let query = supabase.from(table).select(columns);

  for (const condition of conditions) {
    if (condition.isNull) {
      // Handle condition where we want to include both null values and the specified value
      query = query.or(`${condition.column}.is.null,${condition.column}.eq.${condition.value}`);
    } else if (condition.value !== undefined) {
      // Standard equals condition
      query = query.eq(condition.column, condition.value);
    } else {
      // Just check for null
      query = query.is(condition.column, null);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw handleSupabaseError(error, `Error fetching records from ${table}`);
  }

  return data as T[];
}

/**
 * Helper to upload a file to Supabase storage
 * @param bucket The storage bucket name
 * @param file The file to upload
 * @param path Optional path within the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(bucket: string, file: File, path?: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = path || `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    console.error(`Error uploading file to ${bucket}:`, error);
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Helper to sign up with email and password
 * @param email User's email
 * @param password User's password
 */
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }

  return data;
}

/**
 * Helper to sign in with email and password
 * @param email User's email
 * @param password User's password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }

  return data;
}

/**
 * Helper to update the user's password
 * @param password User's new password
 */
export async function updateUserPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Error updating user password:', error);
    throw error;
  }

  return true;
}

/**
 * Helper to update the user's password with old password verification
 * @param email User's email
 * @param oldPassword User's current password
 * @param newPassword User's new password
 */
export async function updateUserPasswordWithVerification(
  email: string,
  oldPassword: string,
  newPassword: string
) {
  // First, verify the old password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: oldPassword,
  });

  if (signInError) {
    console.error('Error verifying current password:', signInError);
    throw new Error('Current password is incorrect');
  }

  // If sign-in is successful, update to the new password
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error('Error updating user password:', error);
    throw error;
  }

  return true;
}

/**
 * Helper to reset the user's password
 * @param email User's email
 */
export async function resetPasswordForEmail(email: string) {
  const origin = window.location.origin;
  const resetPasswordRoute = `${origin}${AppRoutes.ResetPassword}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetPasswordRoute,
  });

  if (error) {
    console.error('Error resetting user password:', error);
    throw error;
  }
}

/**
 * Helper to sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }

  return true;
}

/**
 * Helper to check if a record exists in a table
 * @param table The table name to query
 * @param column The column name to filter on
 * @param value The value to match
 * @returns Boolean indicating if the record exists
 */
export async function recordExists(
  table: string,
  column: string,
  value: string | number | boolean
): Promise<boolean> {
  const { data, error } = await supabase.from(table).select('id').eq(column, value).single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error checking if record exists in ${table}:`, error);
    throw error;
  }

  return !!data;
}

/**
 * Helper to insert a record into a table
 * @param table The table name
 * @param record The record to insert
 * @returns The inserted record
 */
export async function insertRecord<T>(table: string, record: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(record).select().single();

  if (error) {
    throw handleSupabaseError(error, `Error inserting record into ${table}`);
  }

  return data as T;
}

/**
 * Helper to update a record in a table
 * @param table The table name
 * @param id The ID of the record to update
 * @param updates The updates to apply
 * @returns The updated record
 */
export async function updateRecord<T>(table: string, id: string, updates: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();

  if (error) {
    throw handleSupabaseError(error, `Error updating record in ${table}`);
  }

  return data as T;
}

/**
 * Helper to delete a record from a table
 * @param table The table name
 * @param id The ID of the record to delete
 * @returns Success status
 */
export async function deleteRecord(table: string, id: string): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    throw handleSupabaseError(error, `Error deleting record from ${table}`);
  }

  return true;
}

/**
 * Helper to update order of records in a table
 * @param table The table name
 * @param items Array of items with id and order fields
 * @param userId The user ID to include in the updates
 * @returns Whether the update was successful
 */
export async function updateRecordsOrder(
  table: string,
  items: Array<{ id: string; display_order: number }>,
  userId: string
): Promise<boolean> {
  // Prepare updates for each item
  const updates = items.map(item => ({
    id: item.id,
    display_order: item.display_order,
    updated_at: new Date().toISOString(),
    user_id: userId,
  }));

  // Update all records in a single transaction
  const { error } = await supabase.from(table).upsert(updates);

  if (error) {
    throw handleSupabaseError(error, `Error updating record order in ${table}`);
  }

  return true;
}

/**
 * Sorts records by display_order/displayOrder (if available) or created_at/createdAt as fallback
 * @param records Array of records to sort
 * @param ascending Whether to sort in ascending order (true) or descending (false)
 * @returns Sorted array of records
 */
export const sortByDisplayOrderOrCreatedAt = <
  T extends { display_order?: number; created_at?: string },
>(
  records: T[],
  ascending: boolean = true
): T[] => {
  return [...records].sort((a, b) => {
    const aDisplayOrder = a?.display_order;
    const bDisplayOrder = b?.display_order;
    const aCreatedAt = a?.created_at;
    const bCreatedAt = b?.created_at;

    const checks = [null, undefined, 0];

    // If both have display_order/displayOrder, sort by it
    if (checks.includes(aDisplayOrder) && checks.includes(bDisplayOrder)) {
      return ascending
        ? Number(aDisplayOrder) - Number(bDisplayOrder)
        : Number(bDisplayOrder) - Number(aDisplayOrder);
    }

    // If only one has display_order/displayOrder, prioritize the one with it
    if (aDisplayOrder !== undefined && aDisplayOrder !== null) return ascending ? -1 : 1;
    if (bDisplayOrder !== undefined && bDisplayOrder !== null) return ascending ? 1 : -1;

    // If neither has display_order/displayOrder, fallback to created_at/createdAt
    if (aCreatedAt && bCreatedAt) {
      return ascending
        ? new Date(String(aCreatedAt)).getTime() - new Date(String(bCreatedAt)).getTime()
        : new Date(String(bCreatedAt)).getTime() - new Date(String(aCreatedAt)).getTime();
    }

    // If only one has created_at/createdAt, prioritize the one with it
    if (aCreatedAt) return ascending ? -1 : 1;
    if (bCreatedAt) return ascending ? 1 : -1;

    // If neither has any sorting field, maintain original order
    return 0;
  });
};

/**
 * Gets the maximum display_order value from an array of items
 * @param items Array of items that may have a display_order property
 * @returns The maximum display_order value found, or 0 if none exists
 */
export function getMaxOrderValue<T extends { display_order?: number }>(items: T[]): number {
  return items.reduce(
    (max, item) =>
      item.display_order !== undefined && item.display_order > max ? item.display_order : max,
    0
  );
}
