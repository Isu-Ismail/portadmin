import { z } from 'zod';

export const optionalUrl = z.string().trim().refine(
  (val) => !val || /^https?:\/\/.+/i.test(val),
  { message: 'Must be a valid web URL starting with http:// or https://' }
);

export const optionalEmail = z.string().trim().refine(
  (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  { message: 'Must be a valid email address (e.g. name@example.com)' }
);
