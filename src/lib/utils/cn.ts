/**
 * cn — class name utility.
 * Merges Tailwind classes safely: clsx for conditionals, tailwind-merge
 * to deduplicate conflicting utilities (e.g. p-2 + p-4 → p-4).
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
