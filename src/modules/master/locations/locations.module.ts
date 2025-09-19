import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './locations.controller';
import { Location } from './entities/location.entity';
import { CreateLocationHandler } from './commands/handlers/create-location.handler';
import { UpdateLocationHandler } from './commands/handlers/update-location.handler';
import { DeleteLocationHandler } from './commands/handlers/delete-location.handler';
import { GetLocationHandler } from './queries/handlers/get-location.handler';
import { GetLocationsHandler } from './queries/handlers/get-locations.handler';

const CommandHandlers = [
  CreateLocationHandler,
  UpdateLocationHandler,
  DeleteLocationHandler,
];

const QueryHandlers = [GetLocationHandler, GetLocationsHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Location]), CqrsModule],
  controllers: [LocationsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class LocationsModule {}
