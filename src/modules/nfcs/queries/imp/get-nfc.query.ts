export class GetNfcQuery {
  constructor(
    public readonly type: string,
    public readonly visitId: string,
    public readonly guestId: string,
  ) {}
}
