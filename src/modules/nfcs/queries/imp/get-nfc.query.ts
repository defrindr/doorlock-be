export class GetNfcQuery {
  constructor(
    public readonly type: string,
    public readonly data: Record<string, any>,
  ) {}
}
