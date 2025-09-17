import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse } from '@nestjs/swagger';
import { ApiResponseDto } from '../responses/api-response.dto';
import { SingleResponseSchema } from './single-schema.decorator';

// Dekorator ini akan menggantikan 3 baris dekorator di controller Anda
export function ApiSingleResponse<TModel extends Type<any>>(
  model: TModel,
  description: string,
  statusCode = 200, // Default status code 200
) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiOkResponse({
      description,
      schema: SingleResponseSchema(model, description, statusCode),
    }),
  );
}
