import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiExceptionDto } from '../exceptions/api-exception.dto';

export function ApiCommonErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      description:
        'The request is invalid due to incorrect input or missing required fields from the client.',
      type: ApiExceptionDto,
      example: {
        code: 400,
        message: 'Invalid input or missing required fields',
      },
    }),

    ApiUnauthorizedResponse({
      description:
        'The request could not be completed because the client is not authenticated. This typically occurs when missing or invalid credentials are provided.',
      type: ApiExceptionDto,
      example: {
        code: 401,
        message: 'Unauthorized: invalid or missing authentication credentials',
      },
    }),
    ApiForbiddenResponse({
      description:
        'Access to the requested resource is denied due to insufficient permissions or authorization failure.',
      type: ApiExceptionDto,
      example: { code: 403, message: 'Forbidden: insufficient permissions' },
    }),
    ApiNotFoundResponse({
      description:
        'The requested resource could not be found. It may not exist or has been deleted.',
      type: ApiExceptionDto,
      example: { code: 404, message: 'Resource not found' },
    }),
    ApiConflictResponse({
      description:
        'The request could not be completed due to a conflict with the current state of the resource, such as duplicate data or version mismatch.',
      type: ApiExceptionDto,
      example: {
        code: 409,
        message: 'Conflict: duplicate or conflicting data',
      },
    }),
  );
}
