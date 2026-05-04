import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './log.schema';
import { LogProducer, LOG_QUEUE } from './log.producer';
import { LogWorker } from './log.worker';

@Module({
  imports: [
    BullModule.registerQueue({ name: LOG_QUEUE }),
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
  ],
  providers: [LogProducer, LogWorker],
  exports: [LogProducer],
})
export class LogModule {}
