import { HttpException, HttpStatus } from '@nestjs/common';

const ErrorHandler = (error: any) => {
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

  // check what is value duplicated
  if (error.code === '23505') {
    throw new HttpException(
      {
        code: HttpStatus.BAD_REQUEST,
        message: 'Terdapat duplikasi data',
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
