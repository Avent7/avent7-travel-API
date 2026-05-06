import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from './schemas/client.schema';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { ClientMongooseRepository } from './repositories/client.mongoose.repository';
import { CLIENT_REPOSITORY } from './interfaces/client.repository.interface';

@Module({
  imports: [MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }])],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    { provide: CLIENT_REPOSITORY, useClass: ClientMongooseRepository },
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
