import { UpdateCompanyDto } from '../../dto/update-company.dto';

export class UpdateCompanyCommand {
  constructor(
    public readonly id: string,
    public readonly updateCompanyDto: UpdateCompanyDto,
  ) {}
}
