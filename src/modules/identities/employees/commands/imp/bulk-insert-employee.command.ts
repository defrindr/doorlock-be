import { BulkInsertEmployeeDto } from '../../dto/bulk-insert-employee.dto';

export class BulkInsertEmployeeCommand {
  constructor(public readonly bulkInsertEmployeeDto: BulkInsertEmployeeDto) {}
}
