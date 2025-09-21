import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from '../responses/api-response.dto';
import { SingleResponseSchema } from './single-schema.decorator';

// Dekorator ini akan menggantikan 3 baris dekorator di controller Anda
export function ApiSingleResponse<TModel extends Type<any>>(
  model: TModel | null,
  description: string,
  statusCode = 200, // Default status code 200
) {
  if (!model) {
    return applyDecorators(
      ApiExtraModels(ApiResponseDto),
      ApiResponse({
        status: statusCode,
        description,
        schema: SingleResponseSchema(model, description, statusCode),
      }),
    );
  }
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiResponse({
      status: statusCode,
      description,
      schema: SingleResponseSchema(model, description, statusCode),
    }),
  );
}
