import { CreateCompanyDto } from '../../dto/create-company.dto';

export class CreateCompanyCommand {
  constructor(public readonly createCompanyDto: CreateCompanyDto) {}
}
