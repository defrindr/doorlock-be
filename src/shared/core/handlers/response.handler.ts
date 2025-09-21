import { HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../responses/api-response.dto';

export const CreatedResponse = <T = any>(
  data: T,
  message = 'Data saved successfully',
) => new ApiResponseDto<T>(HttpStatus.CREATED, message, data);

export const OkResponse = <T = any>(
  data: T,
  message = 'Successfully running this action',
) => new ApiResponseDto<T>(HttpStatus.OK, message, data);

export const DeletedResponse = (message = 'Data deleted successfully') =>
  new ApiResponseDto(HttpStatus.OK, message);
