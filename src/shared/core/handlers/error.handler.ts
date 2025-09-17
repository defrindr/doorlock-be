import { HttpException, HttpStatus } from '@nestjs/common';
import { ConflictHttpException } from '../exceptions/exception';

const ErrorHandler = (error: any) => {
  console.log('ErrorHandler', error);
  // SQL Server / MSSQL duplicate key error
  if (
    error.code === 'EREQUEST' &&
    error.message.includes('Violation of UNIQUE KEY')
  ) {
    throw new ConflictHttpException(error.message);
  }

  // PostgreSQL duplicate key error
  if (error.code === '23505') {
    throw new ConflictHttpException(error.message);
  }

  if (error.code === 'QueryFailedError') {
    throw new HttpException(
      {
        code: HttpStatus.BAD_REQUEST,
        message:
          'Terjadi kesalahan saat menjalankan aksi, mohon pastikan inputan anda dan coba lagi',
      },
      HttpStatus.BAD_REQUEST,
      {
        cause: error,
      },
    );
  }

  if (error.code === '23503') {
    let message = '';
    const notPresentField = error.detail.match(/Key \((.*?)\)=/)[1];
    const notPresentValue = error.detail.match(/Key .*?\=\((.*?)\)/)[1];

    message = `Data ${notPresentField} dengan nilai ${notPresentValue} tidak ditemukan`;

    throw new HttpException(
      {
        code: HttpStatus.BAD_REQUEST,
        message: message,
      },
      HttpStatus.BAD_REQUEST,
      {
        cause: error,
      },
    );
  }

  throw new HttpException(
    {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        'Terjadi kesalahan saat menjalankan aksi, silahkan hubungi administrator.',
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
    {
      cause: error,
    },
  );
};

export { ErrorHandler };
