import { PagedResult } from '../../common/types/paged-result.type';
import { IClient } from './client.interface';
import { IClientSegmentWithCount } from '../../client-segments/interfaces/client-segment.interface';

export interface IClientsListResult extends PagedResult<IClient> {
  segments: IClientSegmentWithCount[];
}
