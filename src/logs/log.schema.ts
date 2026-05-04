import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LogDocument = HydratedDocument<Log>;

@Schema({ timestamps: true, collection: 'logs' })
export class Log {
  @Prop({ required: true })
  requestId: string;

  @Prop({ required: true, enum: ['info', 'warn', 'error'] })
  level: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  durationMs: number;

  @Prop({ default: null })
  userId: string | null;

  @Prop({ default: null })
  operation: string | null;
}

export const LogSchema = SchemaFactory.createForClass(Log);
