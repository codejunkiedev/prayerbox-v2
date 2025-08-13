/**
 * Generates a random masjid code
 * @returns A 7-character random string for use as a masjid identifier
 */
export const generateMasjidCode = () => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Type guard to check if a value is null or undefined
 * @param value The value to check
 * @returns True if the value is null or undefined
 */
export const isNullOrUndefined = <T>(value: T | null | undefined): value is null | undefined => {
  return value === null || value === undefined;
};
