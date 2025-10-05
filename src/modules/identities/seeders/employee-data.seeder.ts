import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Account } from '../entities/account.entity';
import { AccountEmployee } from '../entities/account-employee.entity';
import { AccountType } from '../entities/account-type.enum';
import { Location } from '@src/modules/master/locations/entities/location.entity';

export class EmployeeDataSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const accountRepository = dataSource.getRepository(Account);
    const employeeRepository = dataSource.getRepository(AccountEmployee);
    const locationRepository = dataSource.getRepository(Location);

    // Check if data already exists
    await employeeRepository.deleteAll();
    const existingEmployees = await employeeRepository.count();
    if (existingEmployees > 0) {
      console.log('Employee data already exists, skipping seeding...');
      return;
    }

    console.log('Seeding employee data from employee.data.ts...');

    // Get the Surabaya location
    const surabayaLocation = await locationRepository.findOne({
      where: { name: 'Surabaya, Osowilangun' },
    });

    if (!surabayaLocation) {
      throw new Error(
        'Surabaya location not found. Please run location seeder first.',
      );
    }

    // Get the Company
    const company = await locationRepository.findOne({
      where: { name: 'PT Cipta Krida Bahari' },
    });

    if (!company) {
      throw new Error('Company not found. Please run company seeder first.');
    }

    // Employee data from employee.data.ts
    const employeeData = `PT Cipta Krida Bahari	35377	Agung Siswanto	Assistant Export-Import Expediting SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	35392	Rahmatullah	Crew Export-Import Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	41337	Achmad Purwanto	Crew Contract Logistics Operations AMNT SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	42138	Choirul Anas	Crew Contract Logistics VALE SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	60878	Sigit Listyo Wardoyo	Officer IT Support & Infrastructure SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	60880	Imam Mulyanto	Officer General Affairs SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	62996	Zumrotudz Dzakiyah	Admin Treasury SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	63654	Arrizqi Nurlayla	Crew Contract Logistics VALE SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	11000116	Hashinta Meidinda Echaputri	Officer Human Capital SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	11000261	Lani Rovendasari Maryono	Admin Site Management Services Support EI	Surabaya, Osowilangun
PT Cipta Krida Bahari	11001055	Yopy Anjas Hendrawan	Crew Contract Logistics KPC SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	11001501	Safiul Karim	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	11001502	Heru Purbianto	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	11003343	Pramudya Ulul Azminulloh	Admin Contract Logistics VALE	Surabaya, Osowilangun
PT Cipta Krida Bahari	11003344	Muhammad Naufal Suhaimi	Crew Contract Logistics KPC SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	11004339	Adam Kidzmal Ghaidza	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	11004562	Yovita Tihardo	Crew Contract Logistics VALE SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	11005159	Rizqi Akbarianto	Crew Export-Import Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	11005205	Qurrota A'yunin	Officer Procurement Indirect SUB EI	Surabaya, Osowilangun
PT Cipta Krida Bahari	11005372	Afrinda Ali Mustofa	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	11005454	Faradhina Maulina Fitri	Crew Contract Logistics AMNT SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	11006110	Nuril Millatu Adnin	Admin Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	11006143	Andrea Novia Samiyono	Crew Contract Logistics VALE SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	11006622	Nabilla Vitasari	Crew Export-Import Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	11007472	Muhamad Jihad Fernanda Putra	Officer Health, Safety & Environment WH & SMS SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	11007878	Bagus Raihan Al Zaky	Crew Contract Logistics AMNT SURABAYA	Surabaya, Osowilangun
PT Cipta Krida Bahari	11008008	Resti Ayu Ambarsari	Crew Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	11008168	Aris Kurniawan	Crew Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	11008272	Amira Naura Salsabila	Crew Distribution Operations International Freight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	11008344	Pramitra Joko Rostianta	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001076	Anton Sugeng Santoso	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001166	Mochammad Farid Fatoni	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001167	Achmad Budi Saifudin	Operator Material Handling Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001170	Eka Rama Permana	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001220	Enjang Hidayat	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001346	Bashori Al Bathoni	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001370	Aninditya Karina Raharja	Admin Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001397	Danang Eka Wijayanto	Assistant Export-Import Support SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001427	Rendy Prestian Arifin	Crew Distribution Operations Seafreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001436	Febri Hari Mudjiantoro	Admin Distribution Operations Airfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001461	Muhammad Zakki Gufron	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001462	Muhammad Jakariya	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001492	Mochamad Mustofa	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001499	Diarto Diarto	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001625	Muhammad Rizal Najibu Khoir	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001626	Ali Machmudi	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001657	Arief Rubal Masruri	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001711	Michael Bangga Pradhifta	Admin Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001727	Nazmul Huda	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001778	Slamat Abidin	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001932	M.Septian Yanuar Rizki	Admin Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91001962	Ahmad Ramadhan Rafsanjani	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002001	Muhajirin Muhajirin	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002045	Widi Antoni Satriajaya	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002046	Risky Dewangga Saputra	Assistant Export-Import Support SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002181	M. Eko Ari Sulistiyo	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002732	Samsudin Nurul Amin	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002735	Ari Setiawan	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002847	Nur Laili Komariyah	Receptionist General Affairs SUB EI	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002849	Sawardi Sawardi	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002884	Warjito Warjito	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002936	Farid Yugo Preasetyo	Assistant Export-Import Support SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002938	Muliyadi Muliyadi	Crew Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002939	Achmad Burhani	Operator Material Handling Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002942	Muhammad Saiful Aris	Operator Material Handling Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002945	Labitha Intania Arifin	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002968	Anggun Anggun	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91002969	Alif Damara Prasetya	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003041	Abdullah  Munir	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003042	Frenky Adi Irawan	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003043	Anang  Alfairuzi	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003095	Aulia Dina Savitri	Admin Distribution Operations Seafreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003113	Adi Soetjipto	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003114	Nur Kamid	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003115	Kadi Priyanto	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003116	Saif Muizzadin Wadaullah	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	91003130	Saepul Anam	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000005	Ajeng Kusumawati	Crew Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000032	Muhammad Andri	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000033	Teguh Santoso	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000056	Muchamad Ismail	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000058	Krisnoyuda -	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000059	Ucci Ventiana Arandita	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000061	Isna'ul Maslamah	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000062	Adhitya Rhama	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000063	Andri Rian Pratama	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000065	Isaac Narendra Akbar	Crew Distribution Operations Airfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000066	Moch. Muhazir	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000099	Hidayatul Khasanah	Crew Export-Import Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000100	Natasya Ferdiyanti	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000102	Veron Sambudi	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000104	Muchammad Chabib	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000111	Fitrotul Izah	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000162	Bagas Fitrianto	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000164	Muhamad Faisal	Crew Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000167	Huda Kurniawan	Crew Warehouse SURABAYA BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000168	Titik Indrawati	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000169	Naksiful Baehaqi	Crew Distribution Operations Seafreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000177	Difanda Pandu Putra Suryono	Crew Distribution Operations Seafreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000179	Matheus Arnold Dheo Prakoso	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000300	Abdurrachman Wakid	Crew Distribution Operations Seafreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000301	Fajar Baihaqi	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000302	Ratno Maulana Nurseha	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000303	Alfrida Shofia Agustin	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000304	Akhmad Miftahul Huda	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000305	Adi Pujiono	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000306	Widodo Cahyono	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000307	Asih Sungkono	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000309	Dani Robertus Sipahelut	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000310	Ilham Mauludin Amin	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000311	Johan Pracipto	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000312	Randha Ain'nul Priambodo	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000315	Maulana Amar Khadafi	Driver Fleet Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000341	Arina Ulfa Hidayah	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000342	Mochamad Dicky	Operator Material Handling Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000343	NOVIA NABILA RACHMAWATI	Admin Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000344	RADLIN MAULANAL HAQ	Admin Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000345	Cahyono	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000346	Achmad Taufik Hanafi	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000347	Honesty Mahardiantony	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000348	Utsman Affan	Admin Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000349	Fawwa Averous Muhammad	Admin Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000350	Puput Tri Utami	Crew Export-Import Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000355	Alifiah Rosydah	Crew Distribution Operations Seafreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000356	Ekky Sasangka	Admin Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000357	Wahyu Noprianto	Driver Distribution Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000358	Fidella Anggraeni	Crew Distribution Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000368	Muhammad Amin	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000369	M. Adriyan Maulana	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000371	Moch Nasir	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000374	Cahya Setia Kurniawan	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000381	Maulana Rizqi Setyanto	Crew Distribution Operations Landfreight SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000382	Said Maulana	Crew Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000392	Muh Firmansyah	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000394	Rahajeng Rahmadhani	Crew Warehouse SURABAYA Non BLC	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000407	Ade Kurniawan	Driver Distribution Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000408	Ferri Susanto	Driver Distribution Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000409	Suhartono	Driver Distribution Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000410	Baktiar Kiswanto	Driver Distribution Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000411	Didik Hariyanto	Driver Distribution Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000420	Mohammad Nazafiudin	Admin Cross Docking Operations SUB	Surabaya, Osowilangun
PT Cipta Krida Bahari	95000431	Muhammad Khoirul Anam	Driver Distribution Operations SUB	Surabaya, Osowilangun`;

    // Parse the data and create employees
    const lines = employeeData.trim().split('\n');
    let processedCount = 0;

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 4) {
        const [, employeeNumber, fullName, position] = parts;

        // Extract department from position (simplified logic)
        let department = 'Operations'; // Default department
        if (position.includes('IT')) {
          department = 'Information Technology';
        } else if (
          position.includes('Human Capital') ||
          position.includes('General Affairs')
        ) {
          department = 'Human Resources';
        } else if (position.includes('Treasury')) {
          department = 'Finance';
        } else if (position.includes('Procurement')) {
          department = 'Procurement';
        } else if (
          position.includes('Health') ||
          position.includes('Safety') ||
          position.includes('Environment')
        ) {
          department = 'Health & Safety';
        }

        // Generate a unique NFC code
        // Create account
        const account = accountRepository.create({
          nfcCode: null,
          accountType: AccountType.EMPLOYEE,
          photo: `photos/${employeeNumber}.jpg`, // Placeholder photo path
          status: 1,
        });

        const savedAccount = await accountRepository.save(account);

        // Create employee record
        const employee = employeeRepository.create({
          accountId: savedAccount.id,
          employeeNumber,
          fullName,
          department,
          position,
          companyId: company.id,
          locationId: surabayaLocation.id,
          violationPoints: 10, // Default violation points
          hireDate: new Date('2020-01-01'), // Default hire date
        });

        await employeeRepository.save(employee);
        processedCount++;
      }
    }

    console.log(`✅ Successfully seeded ${processedCount} employee records.`);
  }
}
