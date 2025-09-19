import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Gate } from '../entities/gate.entity';
import { Location } from '@src/modules/master/locations/entities/location.entity';
import { GateType } from '../entities/gate-type.enum';

export class GateSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const gateRepository = dataSource.getRepository(Gate);
    const locationRepository = dataSource.getRepository(Location);

    // Get existing locations to use as references
    const locations = await locationRepository.find({
      select: ['id', 'name'],
      take: 10,
    });

    if (locations.length === 0) {
      console.log('No locations found. Please run location seeder first.');
      return;
    }

    const gates = [
      // Main Warehouse Jakarta gates
      {
        name: 'Main Gate A',
        locationId: locations[0]?.id,
        type: GateType.PHYSICAL,
        status: 1,
      },
      {
        name: 'Loading Dock Gate 1',
        locationId: locations[0]?.id,
        type: GateType.PHYSICAL,
        status: 1,
      },
      {
        name: 'Emergency Exit Gate',
        locationId: locations[0]?.id,
        type: GateType.PHYSICAL,
        status: 1,
      },
      {
        name: 'Mobile Security Gate',
        locationId: locations[0]?.id,
        type: GateType.PORTABLE,
        status: 1,
      },
      // Production Plant gates
      {
        name: 'Production Line Gate A',
        locationId: locations[1]?.id,
        type: GateType.PHYSICAL,
        status: 1,
      },
      {
        name: 'Quality Control Gate',
        locationId: locations[1]?.id,
        type: GateType.PHYSICAL,
        status: 1,
      },
      {
        name: 'Portable Inspection Gate',
        locationId: locations[1]?.id,
        type: GateType.PORTABLE,
        status: 0,
      },
      // Distribution Center gates
      {
        name: 'Outbound Gate 1',
        locationId: locations[2]?.id,
        type: GateType.PHYSICAL,
        status: 1,
      },
      {
        name: 'Inbound Gate B',
        locationId: locations[2]?.id,
        type: GateType.PHYSICAL,
        status: 1,
      },
      {
        name: 'Cross-dock Mobile Gate',
        locationId: locations[2]?.id,
        type: GateType.PORTABLE,
        status: 1,
      },
      // Additional gates for other locations
      {
        name: 'Service Gate',
        locationId: locations[3]?.id,
        type: GateType.PHYSICAL,
        status: 1,
      },
      {
        name: 'Temporary Access Gate',
        locationId: locations[3]?.id,
        type: GateType.PORTABLE,
        status: 0,
      },
    ].filter((gate) => gate.locationId); // Filter out gates without valid locationId

    for (const gateData of gates) {
      const existingGate = await gateRepository.findOne({
        where: { name: gateData.name, locationId: gateData.locationId },
      });

      if (!existingGate) {
        await gateRepository.create(gateData);
      }
    }

    console.log('Gate seeding completed');
  }
}
