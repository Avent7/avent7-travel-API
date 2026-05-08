export interface IFieldOption {
  label: string;
  value: string;
}

export interface IDependsOn {
  field: string;
  value: string | string[];
}

export interface IBriefingField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'checkbox-group';
  required?: boolean;
  options?: IFieldOption[];
  placeholder?: string;
  hint?: string;
  dependsOn?: IDependsOn;
}

export interface IBriefingSection {
  id: string;
  title: string;
  description?: string;
  fields: IBriefingField[];
}

export interface IBriefingTemplate {
  id: string;
  agencyId: string | null;
  name: string;
  description: string | null;
  isGlobal: boolean;
  isActive: boolean;
  sections: IBriefingSection[];
  createdAt: Date;
  updatedAt: Date;
}
