import { getSchemaPath } from '@nestjs/swagger';
import { ApiResponseDto } from '../responses/api-response.dto';

export const SingleResponseSchema = (
  dto: any,
  exampleMessage = 'Berhasil',
  code: number = 200,
) => ({
  allOf: [
    { $ref: getSchemaPath(ApiResponseDto) },
    {
      type: 'object',
      properties: {
        code: { type: 'number', example: code },
        message: { type: 'string', example: exampleMessage },
        ...(dto && { data: { $ref: getSchemaPath(dto) } }),
      },
    },
  ],
});
