import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { DeleteUserHandler } from './commands/handlers/delete-user.handler';
import { UpdateUserHandler } from './commands/handlers/update-user.handler';
import { GetUserHandler } from './queries/handlers/get-user.handler';
import { GetUsersHandler } from './queries/handlers/get-users.handler';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CqrsModule],
  controllers: [UsersController],
  providers: [
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    GetUserHandler,
    GetUsersHandler,
  ],
})
export class UsersModule {}
