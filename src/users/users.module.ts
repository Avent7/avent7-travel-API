import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserMongooseRepository } from './repositories/user.mongoose.repository';
import { USER_REPOSITORY } from './interfaces/user.repository.interface';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USER_REPOSITORY, useClass: UserMongooseRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
