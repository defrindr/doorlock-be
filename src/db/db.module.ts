import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from '@src/db/options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => dbOptions,
    }),
  ],
})
export class DbModule {}
