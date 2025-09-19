import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Company } from '../entities/company.entity';

export class CompanySeeder implements Seeder {
  async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const companyRepository = dataSource.getRepository(Company);

    const companies = [
      {
        name: 'Tech Innovators Inc.',
        address: '123 Silicon Valley, CA',
        status: 1,
      },
      {
        name: 'Green Energy Solutions',
        address: '456 Renewable Rd, TX',
        status: 1,
      },
      {
        name: 'HealthCare Plus',
        address: '789 Wellness Blvd, NY',
        status: 1,
      },
      {
        name: 'EduFuture Corp.',
        address: '101 Learning Ln, MA',
        status: 1,
      },
    ];

    for (const company of companies) {
      const existingGate = await companyRepository.findOne({
        where: { name: company.name },
      });

      if (!existingGate) {
        await companyRepository.create(company);
      }
    }

    console.log('Company seeding completed');
  }
}
