import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type BriefingTemplateDocument = HydratedDocument<BriefingTemplate>;

export class FieldOption {
  label: string;
  value: string;
}

export class DependsOn {
  field: string;
  value: string | string[];
}

export class BriefingField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'checkbox-group';
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  hint?: string;
  dependsOn?: DependsOn;
}

export class BriefingSection {
  id: string;
  title: string;
  description?: string;
  fields: BriefingField[];
}

@Schema({ timestamps: true })
export class BriefingTemplate {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', default: null })
  agencyId: mongoose.Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: null })
  description: string | null;

  @Prop({ default: false })
  isGlobal: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: [] })
  sections: BriefingSection[];
}

export const BriefingTemplateSchema = SchemaFactory.createForClass(BriefingTemplate);
BriefingTemplateSchema.index({ agencyId: 1 });
BriefingTemplateSchema.index({ isGlobal: 1 });
BriefingTemplateSchema.index({ isActive: 1 });
