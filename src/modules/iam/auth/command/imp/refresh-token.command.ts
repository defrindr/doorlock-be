import { RefreshTokenDto } from '../../dto/refresh-token';

export class RefreshTokenCommand {
  constructor(public readonly payload: RefreshTokenDto) {}
}
