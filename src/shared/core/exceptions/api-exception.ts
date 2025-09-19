import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(message: string, status: HttpStatus, errors: any = []) {
    if (Array.isArray(errors)) {
      if (errors.length > 0) {
        super(
          {
            code: status,
            message,
            errors,
          },
          status,
        );
      } else {
        super(
          {
            code: status,
            message,
          },
          status,
        );
      }
    } else {
      super(
        {
          code: status,
          message,
          errors,
        },
        status,
      );
    }
  }
}
