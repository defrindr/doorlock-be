import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Account } from '../entities/account.entity';
import { AccountEmployee } from '../entities/account-employee.entity';
import { AccountIntern } from '../entities/account-intern.entity';
import { AccountGuest } from '../entities/account-guest.entity';
import { AccountType, IdentificationType } from '../entities/account-type.enum';
import { Company } from '@src/modules/master/companies/entities/company.entity';

export class AccountSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const accountRepository = dataSource.getRepository(Account);
    const employeeRepository = dataSource.getRepository(AccountEmployee);
    const internRepository = dataSource.getRepository(AccountIntern);
    const guestRepository = dataSource.getRepository(AccountGuest);
    const companyRepository = dataSource.getRepository(Company);

    // Check if data already exists
    const existingAccounts = await accountRepository.count();
    if (existingAccounts > 0) {
      console.log('Account data already exists, skipping seeding...');
      return;
    }

    console.log('Seeding account data...');

    // Create employee accounts
    const employeeAccounts = [
      {
        nfcCode: 'NFC001EMP',
        accountType: AccountType.EMPLOYEE,
        employeeId: 'EMP001',
        fullName: 'John Smith',
        department: 'Information Technology',
        position: 'Senior Software Engineer',
        email: 'john.smith@company.com',
        phone: '+628123456001',
        hireDate: new Date('2020-01-15'),
      },
      {
        nfcCode: 'NFC002EMP',
        accountType: AccountType.EMPLOYEE,
        employeeId: 'EMP002',
        fullName: 'Sarah Johnson',
        department: 'Human Resources',
        position: 'HR Manager',
        email: 'sarah.johnson@company.com',
        phone: '+628123456002',
        hireDate: new Date('2019-03-20'),
      },
      {
        nfcCode: 'NFC003EMP',
        accountType: AccountType.EMPLOYEE,
        employeeId: 'EMP003',
        fullName: 'Michael Brown',
        department: 'Information Technology',
        position: 'DevOps Engineer',
        email: 'michael.brown@company.com',
        phone: '+628123456003',
        hireDate: new Date('2021-06-10'),
      },
      {
        nfcCode: 'NFC004EMP',
        accountType: AccountType.EMPLOYEE,
        employeeId: 'EMP004',
        fullName: 'Lisa Davis',
        department: 'Finance',
        position: 'Financial Analyst',
        email: 'lisa.davis@company.com',
        phone: '+628123456004',
        hireDate: new Date('2022-02-14'),
      },
    ];

    const createdEmployees = [];
    for (const empData of employeeAccounts) {
      // Create account
      const account = new Account();
      account.nfcCode = empData.nfcCode;
      account.accountType = empData.accountType;
      account.status = 1;
      const savedAccount = await accountRepository.save(account);

      // Create employee details
      const employee = new AccountEmployee();
      employee.accountId = savedAccount.id;
      employee.employeeId = empData.employeeId;
      employee.fullName = empData.fullName;
      employee.department = empData.department;
      employee.position = empData.position;
      employee.email = empData.email;
      employee.phone = empData.phone;
      employee.hireDate = empData.hireDate;
      const savedEmployee = await employeeRepository.save(employee);

      createdEmployees.push(savedEmployee);
    }

    // Set supervisors (John Smith supervises Michael Brown)
    if (createdEmployees.length >= 3) {
      createdEmployees[2].supervisorId = createdEmployees[0].id;
      await employeeRepository.save(createdEmployees[2]);
    }

    // Create intern accounts
    const internAccounts = [
      {
        nfcCode: 'NFC005INT',
        accountType: AccountType.INTERN,
        internId: 'INT001',
        fullName: 'Alex Wilson',
        university: 'University of Technology',
        major: 'Computer Science',
        email: 'alex.wilson@university.edu',
        phone: '+628123456005',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-12-31'),
      },
      {
        nfcCode: 'NFC006INT',
        accountType: AccountType.INTERN,
        internId: 'INT002',
        fullName: 'Emma Taylor',
        university: 'Business University',
        major: 'Business Administration',
        email: 'emma.taylor@university.edu',
        phone: '+628123456006',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
      },
    ];

    for (const intData of internAccounts) {
      // Create account
      const account = new Account();
      account.nfcCode = intData.nfcCode;
      account.accountType = intData.accountType;
      account.status = 1;
      const savedAccount = await accountRepository.save(account);

      // Create intern details
      const intern = new AccountIntern();
      intern.accountId = savedAccount.id;
      intern.internId = intData.internId;
      intern.fullName = intData.fullName;
      intern.university = intData.university;
      intern.major = intData.major;
      intern.email = intData.email;
      intern.phone = intData.phone;
      intern.startDate = intData.startDate;
      intern.endDate = intData.endDate;
      // Assign John Smith as supervisor for first intern
      if (intData.internId === 'INT001' && createdEmployees.length > 0) {
        intern.supervisorId = createdEmployees[0].id;
      }
      await internRepository.save(intern);
    }

    // Create guest accounts
    const company = await companyRepository.findOne({});
    const guestAccounts = [
      {
        nfcCode: 'NFC007GST',
        accountType: AccountType.GUEST,
        fullName: 'Robert Anderson',
        companyId: company?.id,
        email: 'robert.anderson@techsolutions.com',
        phone: '+628123456007',
        identificationType: IdentificationType.KTP,
        identificationNumber: '1234567890123456',
      },
      {
        nfcCode: 'NFC008GST',
        accountType: AccountType.GUEST,
        fullName: 'Maria Garcia',
        companyId: company?.id,
        email: 'maria.garcia@globalconsulting.com',
        phone: '+628123456008',
        identificationType: IdentificationType.PASSPORT,
        identificationNumber: 'A12345678',
      },
    ];

    for (const guestData of guestAccounts) {
      // Create account
      const account = new Account();
      account.nfcCode = guestData.nfcCode;
      account.accountType = guestData.accountType;
      account.status = 1;
      const savedAccount = await accountRepository.save(account);

      // Create guest details
      const guest = new AccountGuest();
      guest.accountId = savedAccount.id;
      guest.fullName = guestData.fullName;
      guest.companyId = guestData.companyId as string;
      guest.email = guestData.email;
      guest.phone = guestData.phone;
      guest.identificationType = guestData.identificationType;
      guest.identificationNumber = guestData.identificationNumber;
      await guestRepository.save(guest);
    }

    console.log('Account seeding completed successfully!');
    console.log(`Created ${employeeAccounts.length} employees`);
    console.log(`Created ${internAccounts.length} interns`);
    console.log(`Created ${guestAccounts.length} guests`);
  }
}
