import { HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../responses/api-response.dto';

export const CreatedResponse = <T = any>(
  data: T,
  message = 'Data berhasil disimpan',
) => new ApiResponseDto<T>(HttpStatus.CREATED, message, data);

export const OkResponse = <T = any>(data: T, message = 'Berhasil') =>
  new ApiResponseDto<T>(HttpStatus.OK, message, data);

export const DeletedResponse = (message = 'Data berhasil dihapus') =>
  new ApiResponseDto(HttpStatus.OK, message);
