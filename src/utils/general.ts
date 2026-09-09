import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const SCREEN_CODE_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const SCREEN_CODE_LENGTH = 7;

/**
 * Generates a random screen code.
 *
 * The code is a display's only credential, so it comes from the CSPRNG rather
 * than Math.random(), whose state can be recovered from a handful of outputs —
 * an admin who saw a few codes could otherwise predict others. Bytes that
 * would skew the distribution are rejected instead of wrapped, and the length
 * is fixed at 7 (`Math.random().toString(36)` occasionally returned fewer).
 *
 * @returns A 7-character random string for use as a screen identifier
 */
export const generateScreenCode = () => {
  const limit = 256 - (256 % SCREEN_CODE_ALPHABET.length);
  let code = '';
  while (code.length < SCREEN_CODE_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(SCREEN_CODE_LENGTH));
    for (const byte of bytes) {
      if (byte >= limit) continue;
      code += SCREEN_CODE_ALPHABET[byte % SCREEN_CODE_ALPHABET.length];
      if (code.length === SCREEN_CODE_LENGTH) break;
    }
  }
  return code;
};

/**
 * Type guard to check if a value is null or undefined
 * @param value The value to check
 * @returns True if the value is null or undefined
 */
export const isNullOrUndefined = <T>(value: T | null | undefined): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Combines class names using clsx and tailwind-merge
 * @param inputs Class values to combine
 * @returns Combined and merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
