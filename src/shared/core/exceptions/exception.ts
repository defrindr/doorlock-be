import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api-exception';

export class NotFoundHttpException extends ApiException {
  constructor(message = 'Data tidak ditemukan') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class BadRequestHttpException extends ApiException {
  constructor(message = 'Request tidak valid') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ForbiddenHttpException extends ApiException {
  constructor(message = 'Access Denied') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ConflictHttpException extends ApiException {
  constructor(message = 'Request Conflict') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class InternalServerErrorHttpException extends ApiException {
  constructor(message = 'Internal server error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

// Tambahkan exception lain sesuai kebutuhan
