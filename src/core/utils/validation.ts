import { type ZodType, type ZodError } from 'zod';

export interface ValidationSuccess<T> {
  success: true;
  data: T;
  errors: Record<string, string>;
  errorSummary: '';
}

export interface ValidationFailure {
  success: false;
  data: null;
  errors: Record<string, string>;
  errorSummary: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Validates any payload against a Zod schema and extracts a flat dictionary
 * of field-path -> human-readable error messages.
 */
export function validateWithSchema<T>(schema: ZodType<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: {},
      errorSummary: ''
    };
  }

  const errors: Record<string, string> = {};
  const issues = (result.error as ZodError).issues;

  for (const issue of issues) {
    const path = issue.path.join('.') || 'root';
    // Keep first message per field for clarity
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  const firstMsg = issues[0]?.message || 'Validation error';
  const firstField = issues[0]?.path.join('.') || '';
  const errorSummary = firstField ? `${firstField}: ${firstMsg}` : firstMsg;

  return {
    success: false,
    data: null,
    errors,
    errorSummary
  };
}

/**
 * Validates a single value against a schema property on the fly
 */
export function validateField<T>(schema: ZodType<T>, fieldPath: string, data: unknown): string | null {
  const result = schema.safeParse(data);
  if (result.success) return null;

  for (const issue of (result.error as ZodError).issues) {
    const path = issue.path.join('.');
    if (path === fieldPath || path.startsWith(`${fieldPath}.`)) {
      return issue.message;
    }
  }

  return null;
}
