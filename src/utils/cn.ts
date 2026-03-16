import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge.
 * This utility allows for conditional classes while ensuring that Tailwind
 * conflict resolution works correctly (e.g., 'p-4 p-2' becomes 'p-2').
 * 
 * @param inputs - Variadic list of class values (strings, objects, arrays, etc.)
 * @returns A consolidated className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
