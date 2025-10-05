import { SyncParticipantGatesDto } from '../../dto/sync-participant-gates.dto';

export class SyncParticipantGatesCommand {
  constructor(
    public readonly visitId: string,
    public readonly visitParticipantId: string,
    public readonly syncGatesDto: SyncParticipantGatesDto,
  ) {}
}
