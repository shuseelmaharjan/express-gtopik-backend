import { randomUUID } from 'crypto';
import path from 'path';

/**
 * Generate a unique filename preserving extension.
 * Format: <timestamp>-<uuid><ext>
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = `${Date.now()}-${randomUUID()}`;
  return `${base}${ext}`;
}
