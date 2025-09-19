import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { Location } from '@src/modules/master/locations/entities/location.entity';
import {
  ConflictHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { GateDto } from '../../dto/gate.dto';
import { Gate } from '../../entities/gate.entity';
import { UpdateGateCommand } from '../imp/update-gate.command';

@CommandHandler(UpdateGateCommand)
export class UpdateGateHandler
  extends BaseHandler<UpdateGateCommand, ApiResponseDto<GateDto>>
  implements ICommandHandler<UpdateGateCommand, ApiResponseDto<GateDto>>
{
  constructor(
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    super();
  }

  async handle(command: UpdateGateCommand): Promise<ApiResponseDto<GateDto>> {
    const { id, updateGateDto } = command;

    // Find existing gate
    const gate = await this.gateRepository.findOne({
      where: { id },
    });

    if (!gate) {
      throw new NotFoundHttpException(`Gate with ID ${id} not found`);
    }

    // Validate location exists if locationId is being updated
    if (updateGateDto.locationId) {
      await this.validateLocationExists(updateGateDto.locationId);
    }

    // Check if new name conflicts with existing gate in the same location
    if (updateGateDto.name && updateGateDto.name !== gate.name) {
      const locationId = updateGateDto.locationId || gate.locationId;
      await this.validateGateNameInLocation(updateGateDto.name, locationId, id);
    }

    // Update gate properties
    Object.assign(gate, {
      ...updateGateDto,
      updatedAt: new Date(),
    });

    // Save updated gate
    const savedGate = await this.gateRepository.save(gate);

    const gateDto = plainToInstance(GateDto, savedGate, {
      excludeExtraneousValues: true,
    });

    return OkResponse(gateDto, 'Gate updated successfully');
  }

  /**
   * Validate that location exists
   * @param locationId Location ID to validate
   * @throws NotFoundException if location doesn't exist
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
   * @param excludeId Gate ID to exclude from check (for updates)
   * @throws ConflictException if gate name already exists in the location
   */
  private async validateGateNameInLocation(
    name: string,
    locationId: string,
    excludeId?: string,
  ): Promise<void> {
    const query = this.gateRepository
      .createQueryBuilder('gate')
      .where('gate.name = :name', { name })
      .andWhere('gate.locationId = :locationId', { locationId });

    if (excludeId) {
      query.andWhere('gate.id != :excludeId', { excludeId });
    }

    const existingGate = await query.getOne();

    if (existingGate) {
      throw new ConflictHttpException(
        `Gate with name '${name}' already exists in this location`,
      );
    }
  }
}
