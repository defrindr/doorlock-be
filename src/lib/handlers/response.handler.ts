import { HttpException, HttpStatus } from '@nestjs/common';

export const BadRequestResponse = (message: string = '') => {
  throw new HttpException(
    {
      code: HttpStatus.BAD_REQUEST,
      message,
    },
    HttpStatus.BAD_REQUEST,
  );
};

export const SuccessResponse = (message: string = '', data: any = []) => {
  return {
    code: HttpStatus.OK,
    message,
    data,
  };
};
