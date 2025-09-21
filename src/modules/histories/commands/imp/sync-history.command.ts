import { SyncHistoryDto } from '../../dto/sync-history.dto';

export class SyncHistoryCommand {
  constructor(public readonly syncHistoriesDto: SyncHistoryDto[]) {}
}
