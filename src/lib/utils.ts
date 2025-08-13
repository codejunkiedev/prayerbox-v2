import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * @param inputs Class values to combine
 * @returns Combined and merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates password strength based on various criteria
 * @param password The password to evaluate
 * @returns Strength score from 0 to 5
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(5, score);
}

/**
 * Gets the label and color for a password strength score
 * @param score The password strength score (0-5)
 * @returns Object containing label text and color class
 */
export function getPasswordStrengthLabel(score: number): { label: string; color: string } {
  switch (score) {
    case 0:
      return { label: 'Very Weak', color: 'bg-red-500' };
    case 1:
      return { label: 'Weak', color: 'bg-red-400' };
    case 2:
      return { label: 'Fair', color: 'bg-yellow-500' };
    case 3:
      return { label: 'Good', color: 'bg-yellow-400' };
    case 4:
      return { label: 'Strong', color: 'bg-green-400' };
    case 5:
      return { label: 'Very Strong', color: 'bg-green-500' };
    default:
      return { label: 'Very Weak', color: 'bg-red-500' };
  }
}
