import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { ConflictHttpException } from '@src/shared/core/exceptions/exception';
import { Location } from '../../entities/location.entity';
import { DeleteLocationCommand } from '../imp/delete-location.command';

@CommandHandler(DeleteLocationCommand)
export class DeleteLocationHandler
  extends BaseHandler<DeleteLocationCommand, ApiResponseDto<null>>
  implements ICommandHandler<DeleteLocationCommand, ApiResponseDto<null>>
{
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    super();
  }

  async handle(command: DeleteLocationCommand): Promise<ApiResponseDto<null>> {
    const { id } = command;

    // Find existing location
    const location = await this.locationRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new ConflictHttpException(`Location with ID ${id} not found`);
    }

    // Soft delete the location
    await this.locationRepository.softDelete(id);

    return OkResponse(null, 'Location deleted successfully');
  }
}
