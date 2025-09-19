import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { ConflictHttpException } from '@src/shared/core/exceptions/exception';
import { LocationDto } from '../../dto/location.dto';
import { Location } from '../../entities/location.entity';
import { CreateLocationCommand } from '../imp/create-location.command';

@CommandHandler(CreateLocationCommand)
export class CreateLocationHandler
  extends BaseHandler<CreateLocationCommand, ApiResponseDto<LocationDto>>
  implements ICommandHandler<CreateLocationCommand, ApiResponseDto<LocationDto>>
{
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    super();
  }

  async handle(
    command: CreateLocationCommand,
  ): Promise<ApiResponseDto<LocationDto>> {
    const { createLocationDto } = command;

    // Check if location name already exists
    await this.validateLocationName(createLocationDto.name);

    // Create new location
    const location = this.locationRepository.create({
      name: createLocationDto.name,
      type: createLocationDto.type,
      status: createLocationDto.status ?? 1,
    });

    // Save location to database
    const savedLocation = await this.locationRepository.save(location);

    const locationDto = plainToInstance(LocationDto, savedLocation, {
      excludeExtraneousValues: true,
    });

    return CreatedResponse(locationDto, 'Location created successfully');
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
