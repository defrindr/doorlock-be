import { Expose } from 'class-transformer';

export class ViolationDto {
  @Expose()
  id: string;

  @Expose()
  employeeId: string;

  @Expose()
  pointBefore: number;

  @Expose()
  pointMinus: number;

  @Expose()
  pointAfter: number;

  @Expose()
  violationDate: Date;

  @Expose()
  violationDescription: string;

  @Expose()
  createdAt: Date;

  // Relations
  @Expose()
  employee?: {
    id: string;
    name: string;
    employeeId: string;
  };
}
