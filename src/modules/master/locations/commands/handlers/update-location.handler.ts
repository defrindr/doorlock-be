import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import {
  ConflictHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { LocationDto } from '../../dto/location.dto';
import { Location } from '../../entities/location.entity';
import { UpdateLocationCommand } from '../imp/update-location.command';

@CommandHandler(UpdateLocationCommand)
export class UpdateLocationHandler
  extends BaseHandler<UpdateLocationCommand, ApiResponseDto<LocationDto>>
  implements ICommandHandler<UpdateLocationCommand, ApiResponseDto<LocationDto>>
{
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    super();
  }

  async handle(
    command: UpdateLocationCommand,
  ): Promise<ApiResponseDto<LocationDto>> {
    const { id, updateLocationDto } = command;

    // Find existing location
    const location = await this.locationRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundHttpException(`Location with ID ${id} not found`);
    }

    // Check if new name conflicts with existing location (if name is being changed)
    if (updateLocationDto.name && updateLocationDto.name !== location.name) {
      await this.validateLocationName(updateLocationDto.name);
    }

    // Update location properties
    Object.assign(location, {
      ...updateLocationDto,
      updatedAt: new Date(),
    });

    // Save updated location
    const savedLocation = await this.locationRepository.save(location);

    const locationDto = plainToInstance(LocationDto, savedLocation, {
      excludeExtraneousValues: true,
    });

    return OkResponse(locationDto, 'Location updated successfully');
  }

  /**
   * Validate that location name doesn't already exist
   * @param name Location name to validate
   * @throws ConflictHttpException if location name already exists
   */
  private async validateLocationName(name: string): Promise<void> {
    const existingLocation = await this.locationRepository.findOne({
      where: { name },
    });

    if (existingLocation) {
      throw new ConflictHttpException(
        `Location with name '${name}' already exists`,
      );
    }
  }
}
