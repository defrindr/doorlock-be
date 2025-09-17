import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ApiExceptionDto } from '../exceptions/api-exception.dto';

export function ApiCommonErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Permintaan tidak valid karena kesalahan input dari klien.',
      type: ApiExceptionDto,
      // 'example' sekarang berada di level atas
      example: { code: 400, message: 'Invalid input' },
    }),
    ApiForbiddenResponse({
      description: 'Akses ditolak karena tidak memiliki izin yang cukup.',
      type: ApiExceptionDto,
      example: { code: 403, message: 'Forbidden' },
    }),
    ApiNotFoundResponse({
      description: 'Sumber daya yang diminta tidak dapat ditemukan.',
      type: ApiExceptionDto,
      example: { code: 404, message: 'Not found' },
    }),
    ApiConflictResponse({
      description:
        'Terjadi konflik karena data yang ada sudah ada (misalnya, duplikasi).',
      type: ApiExceptionDto,
      example: { code: 409, message: 'Conflict' },
    }),
  );
}
