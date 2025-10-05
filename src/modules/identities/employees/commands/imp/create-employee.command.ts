import { CreateEmployeeDto } from '../../dto/create-employee.dto';

export class CreateEmployeeCommand {
  constructor(public readonly createEmployeeDto: CreateEmployeeDto) {}
}
