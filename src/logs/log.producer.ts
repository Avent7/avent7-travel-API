import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const LOG_QUEUE = 'logs';

export interface LogJobPayload {
  requestId: string;
  level: 'info' | 'warn' | 'error';
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  userId?: string | null;
  operation?: string | null;
}

@Injectable()
export class LogProducer {
  constructor(@InjectQueue(LOG_QUEUE) private readonly queue: Queue) {}

  async enqueue(payload: LogJobPayload): Promise<void> {
    await this.queue.add('log', payload, {
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    });
  }
}
