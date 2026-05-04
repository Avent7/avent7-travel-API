import { BlockType } from '../enums/block.enum';

export interface IItineraryBlock {
  id: string;
  itineraryId: string;
  blockType: BlockType;
  dayNumber: number;
  sortOrder: number;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  locationName: string | null;
  costUsd: number | null;
  saleUsd: number | null;
  markupPct: number | null;
  blockData: Record<string, any> | null;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
