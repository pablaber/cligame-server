import { validator } from 'hono/validator';
import type { ZodSchema } from 'zod';
import { BadRequestError } from './errors';

/**
 * Validates the query parameters of a request.
 */
export function validateQueryParams(schema: ZodSchema) {
  return validator('query', (value, c) => {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestError('Invalid Query Parameters', {
        publicDetails: {
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      });
    }
    return parsed.data;
  });
}

/**
/**
 * Validates the JSON body of a request.
 */
export function validateJsonBody(schema: ZodSchema) {
  return validator('json', (value, c) => {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestError('Invalid Request Body', {
        publicDetails: {
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      });
    }
    return parsed.data;
  });
}
