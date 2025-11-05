import { Controller, Get, Param, Delete } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { NfcDto } from './dto/nfc.dto';
import { GetNfcQuery } from './queries/imp/get-nfc.query';
import { UnassignNfcCommand } from './commands/imp/unassign-nfc.command';

@Controller('nfcs')
@ApiTags('Nfcs')
export class NfcsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('visitor/:visitId/:guestId')
  @ApiOperation({
    summary: 'Retrieve NFC record for a visitor account',
    description: `Fetch the NFC information linked to a specific visitor (or visit) and account.
Path parameters:
- \`visitId\`: UUID of the visit or visitor entity
- \`guestId\`: UUID of the guest associated with the NFC record

Returns the NFC payload wrapped in the standard API response format.`,
  })
  @ApiSingleResponse(NfcDto, 'Nfc retrieved successfully')
  @ApiCommonErrors()
  async findOne(
    @Param('visitId') visitId: string,
    @Param('guestId') guestId: string,
  ): Promise<ApiResponseDto<NfcDto>> {
    console.log(visitId, guestId);
    return this.queryBus.execute(
      new GetNfcQuery('visitor', { visitId, guestId }),
    );
  }

  @Get('employee/:employeeId')
  @ApiOperation({
    summary: 'Retrieve NFC record for a employee account',
    description: `Fetch the NFC information linked to a specific employee and account.
Path parameters:
- \`employeeId\`: UUID of the employee

Returns the NFC payload wrapped in the standard API response format.`,
  })
  @ApiSingleResponse(NfcDto, 'Nfc retrieved successfully')
  @ApiCommonErrors()
  async findEmployee(
    @Param('employeeId') employeeId: string,
  ): Promise<ApiResponseDto<NfcDto>> {
    return this.queryBus.execute(new GetNfcQuery('employee', { employeeId }));
  }

  @Delete('unassign/:accountId')
  @ApiOperation({
    summary: 'Unassign NFC card from account',
    description:
      'Remove NFC card assignment from an account and clear gate occupancy records',
  })
  @ApiSingleResponse(null, 'NFC card unassigned successfully')
  @ApiCommonErrors()
  async unassignNfc(
    @Param('accountId') accountId: string,
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(new UnassignNfcCommand(accountId));
  }
}
