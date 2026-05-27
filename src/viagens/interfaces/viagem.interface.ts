import { ViagemStatus } from '../enums/viagem.enum';
import { IBriefing } from '../../briefings/interfaces/briefing.interface';
import { IProposta } from '../../propostas/interfaces/proposta.interface';
import { IBriefingTemplate } from '../../briefing-templates/interfaces/briefing-template.interface';
import { IPassenger } from '../../passengers/interfaces/passenger.interface';

export interface IViagem {
  id: string;
  agencyId: string;
  clientId: string;
  passengerId: string | null;
  createdByUserId: string | null;
  viagemCode: string;
  title: string;
  status: ViagemStatus;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IViagemDetail extends IViagem {
  briefings: IBriefing[];
  propostas: IProposta[];
  briefingTemplates: IBriefingTemplate[];
  passengers: IPassenger[];
}
