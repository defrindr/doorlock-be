export class ExportHistoriesQuery {
  constructor(
    public readonly format: 'excel' | 'pdf',
    public readonly filters: {
      timestamp?: { start: string; end: string };
      search?: string;
      status?: string;
    },
  ) {}
}
