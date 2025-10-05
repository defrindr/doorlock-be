import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FastifyRequest } from 'fastify';
import { createValidationException } from '../factories/validation-exception.factory';

interface MultipartRequest extends FastifyRequest {
  isMultipart(): boolean;
  parts(): AsyncIterableIterator<any>;
}

export const MultipartForm = createParamDecorator(
  async (dtoClass: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<MultipartRequest>();

    if (!request.isMultipart()) {
      throw new BadRequestException('Request is not multipart/form-data');
    }

    const formData: Record<string, any> = {};
    const parts = request.parts();

    for await (const part of parts) {
      if (part.file) {
        const buffer = await part.toBuffer();
        formData[part.fieldname] = {
          filename: part.filename,
          mimetype: part.mimetype,
          buffer,
        };
      } else {
        if (
          typeof part.value === 'string' &&
          part.value.startsWith('[') &&
          part.value.endsWith(']')
        ) {
          try {
            part.value = JSON.parse(part.value);
          } catch {
            // if it's not valid JSON, just keep it as-is
          }
        }
        formData[part.fieldname] = part.value;
      }
    }

    // If no DTO class is passed → return raw
    if (!dtoClass) return formData;

    // Transform raw → DTO
    const dtoInstance = plainToInstance(dtoClass, formData, {
      enableImplicitConversion: true,
    });

    // Validate DTO
    const errors = await validate(dtoInstance as object);

    if (errors.length > 0) {
      throw createValidationException(errors);
    }

    return dtoInstance;
  },
);
