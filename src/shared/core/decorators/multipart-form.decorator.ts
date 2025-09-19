import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

// Extend FastifyRequest to include multipart methods
interface MultipartRequest extends FastifyRequest {
  isMultipart(): boolean;
  parts(): AsyncIterableIterator<any>;
}

export const MultipartForm = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<MultipartRequest>();

    // Check if request has multipart content
    if (!request.isMultipart()) {
      throw new Error('Request is not multipart');
    }

    const formData: any = {};
    let fileData: any = null;

    // Process multipart data
    const parts = request.parts();

    for await (const part of parts) {
      if (part.file) {
        // Handle file upload
        const buffer = await part.toBuffer();
        fileData = {
          filename: part.filename,
          mimetype: part.mimetype,
          buffer: buffer,
        };
        formData[part.fieldname] = fileData;
      } else {
        // Handle regular form fields
        formData[part.fieldname] = part.value;
      }
    }

    return formData;
  },
);
