import { validator } from 'hono/validator';
import type { ZodSchema } from 'zod';

/**
 * Validates the query parameters of a request.
 */
export function validateQueryParams(schema: ZodSchema) {
  return validator('query', (value, c) => {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json(
        {
          message: 'Invalid Query Parameters',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    }
  });
}

/**
 * Validates the JSON body of a request.
 */
export function validateJsonBody(schema: ZodSchema) {
  return validator('json', (value, c) => {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json(
        {
          message: 'Invalid Request Body',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    }
    return parsed.data;
  });
}

