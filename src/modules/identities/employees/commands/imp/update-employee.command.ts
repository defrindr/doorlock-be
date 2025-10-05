import { UpdateEmployeeDto } from '../../dto/update-employee.dto';

export class UpdateEmployeeCommand {
  constructor(
    public readonly id: string,
    public readonly updateEmployeeDto: UpdateEmployeeDto,
  ) {}
}
