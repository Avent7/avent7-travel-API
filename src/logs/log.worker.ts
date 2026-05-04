import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './log.schema';
import { LOG_QUEUE, LogJobPayload } from './log.producer';

@Processor(LOG_QUEUE)
export class LogWorker extends WorkerHost {
  constructor(@InjectModel(Log.name) private readonly logModel: Model<LogDocument>) {
    super();
  }

  async process(job: Job<LogJobPayload>): Promise<void> {
    await this.logModel.create(job.data);
  }
}
