import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { PropostaStatus } from '../enums/proposta.enum';
import { BlockType } from '../../proposta-blocks/enums/block.enum';

export type PropostaDocument = HydratedDocument<Proposta>;

const BlockSubSchema = new mongoose.Schema(
  {
    blockType: { type: String, enum: Object.values(BlockType), required: true },
    dayNumber: { type: Number, required: true, default: 1 },
    sortOrder: { type: Number, default: 0 },
    saleUsd: { type: Number, default: null },
    blockData: { type: mongoose.Schema.Types.Mixed, default: null },
    isConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true, _id: true },
);

@Schema({ timestamps: true })
export class Proposta {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Viagem', required: true })
  viagemId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Briefing', default: null })
  briefingId: mongoose.Types.ObjectId | null;

  @Prop({ required: true, unique: true, trim: true })
  propostaCode: string;

  @Prop({ default: null })
  title: string | null;

  @Prop({ enum: PropostaStatus, default: PropostaStatus.PENDING })
  status: PropostaStatus;

  @Prop({ default: null })
  startDate: Date | null;

  @Prop({ default: null })
  endDate: Date | null;

  @Prop({ default: null })
  totalNights: number | null;

  @Prop({ default: 0 })
  totalCostUsd: number;

  @Prop({ default: 0 })
  totalSaleUsd: number;

  @Prop({ default: 0 })
  totalMarkupUsd: number;

  @Prop({ default: 0 })
  platformFeeUsd: number;

  @Prop({ default: 0 })
  agencyProfitUsd: number;

  @Prop({ default: null })
  heroImageUrl: string | null;

  @Prop({ type: [String], default: [] })
  destinations: string[];

  @Prop({ default: null })
  clientMessage: string | null;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Passenger', default: [] })
  passengerIds: mongoose.Types.ObjectId[];

  @Prop({ default: false })
  clientIsTraveling: boolean;

  @Prop({ default: 'USD' })
  baseCurrency: string;

  @Prop({ type: Object, default: {} })
  fxRates: Record<string, number>;

  @Prop({ default: null })
  sentToClientAt: Date | null;

  @Prop({ default: null })
  approvedAt: Date | null;

  @Prop({ default: null })
  bookedAt: Date | null;

  @Prop({ type: [BlockSubSchema], default: [] })
  blocks: mongoose.Types.DocumentArray<any>;
}

export const PropostaSchema = SchemaFactory.createForClass(Proposta);
PropostaSchema.index({ agencyId: 1 });
PropostaSchema.index({ viagemId: 1 });
