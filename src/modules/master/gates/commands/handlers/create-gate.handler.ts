import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { Gate } from '../../entities/gate.entity';
import { GateDto } from '../../dto/gate.dto';
import { CreateGateCommand } from '../imp/create-gate.command';
import { Location } from '@src/modules/master/locations/entities/location.entity';
import {
  ConflictHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';

@CommandHandler(CreateGateCommand)
export class CreateGateHandler
  extends BaseHandler<CreateGateCommand, ApiResponseDto<GateDto>>
  implements ICommandHandler<CreateGateCommand, ApiResponseDto<GateDto>>
{
  constructor(
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    super();
  }

  async handle(command: CreateGateCommand): Promise<ApiResponseDto<GateDto>> {
    const { createGateDto } = command;

    await Promise.all([
      // Validate location exists
      this.validateLocationExists(createGateDto.locationId),
      // Check if gate name already exists in the same location
      this.validateGateNameInLocation(
        createGateDto.name,
        createGateDto.locationId,
      ),
    ]);

    // Create new gate
    const identifier = await this.getMaxIdentifier();
    const gate = this.gateRepository.create({
      name: createGateDto.name,
      locationId: createGateDto.locationId,
      type: createGateDto.type,
      status: createGateDto.status ?? 1,
      gateIdentifier: identifier,
    });

    // Save gate to database
    const savedGate = await this.gateRepository.save(gate);

    const gateDto = plainToInstance(GateDto, savedGate, {
      excludeExtraneousValues: true,
    });

    return CreatedResponse(gateDto, 'Gate created successfully');
  }

  /**
   * Validate that location exists
   * @param locationId Location ID to validate
   * @throws NotFoundHttpException if location doesn't exist
   */
  private async validateLocationExists(locationId: string): Promise<void> {
    const location = await this.locationRepository.findOne({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundHttpException(
        `Location with ID ${locationId} not found`,
      );
    }
  }

  /**
   * Validate that gate name doesn't already exist in the same location
   * @param name Gate name to validate
   * @param locationId Location ID to check within
   * @throws ConflictHttpException if gate name already exists in the location
   */
  private async validateGateNameInLocation(
    name: string,
    locationId: string,
  ): Promise<void> {
    const existingGate = await this.gateRepository.findOne({
      where: { name, locationId },
    });

    if (existingGate) {
      throw new ConflictHttpException(
        `Gate with name '${name}' already exists in this location`,
      );
    }
  }

  private async getMaxIdentifier() {
    const maxIdentifier = await this.gateRepository.maximum('gateIdentifier');

    return maxIdentifier ? maxIdentifier + 1 : 1;
  }
}
