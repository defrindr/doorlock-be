import { Logger } from '@nestjs/common';
import { ICommandHandler, ICommand } from '@nestjs/cqrs';

// TCommand adalah tipe dari command-nya
// TResult adalah tipe dari hasil yang diharapkan (bisa any atau tipe spesifik)
export abstract class BaseHandler<TCommand extends ICommand, TResult = any>
  implements ICommandHandler<ICommand>
{
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Method ini yang akan dipanggil oleh NestJS CQRS.
   * Kita jadikan 'final' (konsepnya) dan tidak boleh di-override.
   * Tugasnya adalah mengatur alur eksekusi.
   */
  async execute(command: TCommand): Promise<TResult> {
    let result: TResult = undefined as unknown as TResult;
    try {
      await this.beforeRun(command);

      result = await this.handle(command);
    } catch (error) {
      this.logger.error(
        `Error executing command ${command.constructor.name}`,
        error.stack,
        { command },
      );
      throw error;
    } finally {
      await this.afterRun(result, command);
    }

    return result;
  }

  /**
   * Hook yang berjalan SEBELUM method handle.
   * Bisa di-override oleh kelas turunan jika butuh logika spesifik.
   * Berguna untuk validasi awal atau logging.
   */
  protected async beforeRun(command: TCommand): Promise<void> {
    this.logger.log(`Executing command: ${command.constructor.name}`);
    this.logger.debug(`With payload:`, { command });
  }

  /**
   * Hook yang berjalan SETELAH method handle.
   * Bisa di-override oleh kelas turunan.
   * Berguna untuk logging hasil, cleanup, atau metrics.
   */
  protected async afterRun(result: TResult, command: TCommand): Promise<void> {
    this.logger.log(
      `Successfully executed command: ${command.constructor.name}`,
    );
    this.logger.debug(`With result:`, { result });
  }

  protected abstract handle(command: TCommand): Promise<TResult>;
}
