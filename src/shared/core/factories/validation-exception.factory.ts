import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

type ErrorAccumulator = {
  field: string;
  message: string;
};

/**
 * Fungsi ini mengambil array error dari class-validator dan mengubahnya
 * menjadi format respons standar yang kita inginkan.
 * @param validationErrors Array error dari ValidationPipe
 * @returns Instance BadRequestException dengan payload yang sudah diformat
 */
export function createValidationException(
  validationErrors: ValidationError[] = [],
) {
  // Format error ke dalam bentuk { field: [messages] }
  const formattedErrors = validationErrors.reduce((accumulator, error) => {
    if (error.property && error.constraints) {
      accumulator.push({
        field: error.property,
        message: Object.values(error.constraints).join(', '),
      });
    }
    return accumulator;
  }, [] as ErrorAccumulator[]);

  // Ambil pesan error pertama untuk ditampilkan sebagai pesan utama
  const firstErrorKey = Object.keys(formattedErrors)[0];
  const firstErrorMessage = firstErrorKey
    ? formattedErrors[0].message
    : 'Input data tidak valid';

  const response = {
    code: HttpStatus.BAD_REQUEST,
    message: firstErrorMessage,
    errors: formattedErrors,
  };

  // Gunakan BadRequestException agar lebih semantik
  return new BadRequestException(response);
}
