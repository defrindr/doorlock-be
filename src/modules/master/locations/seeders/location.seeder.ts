import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Location } from '../entities/location.entity';
import { LocationType } from '../entities/location-type.enum';

export class LocationSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const locationRepository = dataSource.getRepository(Location);

    const locations = [
      {
        name: 'Main Warehouse Jakarta',
        type: LocationType.WAREHOUSE,
        status: 1,
      },
      {
        name: 'Secondary Warehouse Bandung',
        type: LocationType.WAREHOUSE,
        status: 1,
      },
      {
        name: 'Manufacturing Plant Surabaya',
        type: LocationType.IN_PLANT,
        status: 1,
      },
      {
        name: 'Production Facility Medan',
        type: LocationType.IN_PLANT,
        status: 1,
      },
      {
        name: 'CrossDock Hub Semarang',
        type: LocationType.CROSSDOCK,
        status: 1,
      },
      {
        name: 'Distribution Center Yogyakarta',
        type: LocationType.CROSSDOCK,
        status: 0,
      },
      {
        name: 'Cold Storage Warehouse Malang',
        type: LocationType.WAREHOUSE,
        status: 1,
      },
      {
        name: 'Surabaya, Osowilangun',
        type: LocationType.WAREHOUSE,
        status: 1,
      },
      {
        name: 'Chemical Plant Cikarang',
        type: LocationType.IN_PLANT,
        status: 0,
      },
    ];

    for (const locationData of locations) {
      const existingLocation = await locationRepository.findOne({
        where: { name: locationData.name },
      });

      if (!existingLocation) {
        const location = locationRepository.create(locationData);
        await locationRepository.save(location);
      }
    }
  }
}
