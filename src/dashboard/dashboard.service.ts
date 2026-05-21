import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Proposta, PropostaDocument } from '../propostas/schemas/proposta.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { PropostaStatus } from '../propostas/enums/proposta.enum';

export interface KpiItem {
  label: string;
  value: string;
  delta: string;
  changeType: 'up' | 'down' | 'neutral';
}

export interface RevenueBreakdownItem {
  month: string;
  gmv: number;
  cost: number;
  markup: number;
  platformFee: number;
  agencyProfit: number;
}

export interface EngagementBucket {
  month: string;
  label: string;
  email: number;
  whatsapp: number;
  phone: number;
  total: number;
}

const MONTH_LABELS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatUsd(value: number): string {
  const rounded = Math.round(value);
  return `US$ ${rounded.toLocaleString('pt-BR')}`;
}

function formatPct(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '' : '';
  return `${sign}${value.toFixed(1).replace('.', ',')}%`;
}

function pctChange(current: number, previous: number): { delta: string; changeType: 'up' | 'down' | 'neutral' } {
  if (previous === 0) {
    if (current === 0) return { delta: '0,0%', changeType: 'neutral' };
    return { delta: '+100,0%', changeType: 'up' };
  }
  const pct = ((current - previous) / previous) * 100;
  const changeType: 'up' | 'down' | 'neutral' = pct > 0.05 ? 'up' : pct < -0.05 ? 'down' : 'neutral';
  return { delta: formatPct(pct), changeType };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Proposta.name) private readonly propostaModel: Model<PropostaDocument>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async getKpis(agencyId: string): Promise<KpiItem[]> {
    const agencyObjectId = new Types.ObjectId(agencyId);
    const now = new Date();
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const prevYearStart = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
    const prevYearSameInstant = new Date(Date.UTC(
      now.getUTCFullYear() - 1,
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
    ));

    const aggregate = async (from: Date, to: Date) => {
      const [row] = await this.propostaModel.aggregate<{
        gmv: number;
        cost: number;
        markup: number;
        platformFee: number;
        agencyProfit: number;
        count: number;
      }>([
        {
          $match: {
            agencyId: agencyObjectId,
            status: PropostaStatus.APPROVED,
            createdAt: { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id: null,
            gmv: { $sum: '$totalSaleUsd' },
            cost: { $sum: '$totalCostUsd' },
            markup: { $sum: '$totalMarkupUsd' },
            platformFee: { $sum: '$platformFeeUsd' },
            agencyProfit: { $sum: '$agencyProfitUsd' },
            count: { $sum: 1 },
          },
        },
      ]);
      return row ?? { gmv: 0, cost: 0, markup: 0, platformFee: 0, agencyProfit: 0, count: 0 };
    };

    const ytd = await aggregate(yearStart, now);
    const prevYtd = await aggregate(prevYearStart, prevYearSameInstant);

    const takeRate = ytd.gmv > 0 ? (ytd.platformFee / ytd.gmv) * 100 : 0;
    const prevTakeRate = prevYtd.gmv > 0 ? (prevYtd.platformFee / prevYtd.gmv) * 100 : 0;
    const ticket = ytd.count > 0 ? ytd.gmv / ytd.count : 0;
    const prevTicket = prevYtd.count > 0 ? prevYtd.gmv / prevYtd.count : 0;

    return [
      { label: 'GMV (YTD)', value: formatUsd(ytd.gmv), ...pctChange(ytd.gmv, prevYtd.gmv) },
      { label: 'Lucro da Agência (YTD)', value: formatUsd(ytd.agencyProfit), ...pctChange(ytd.agencyProfit, prevYtd.agencyProfit) },
      { label: 'Take Rate Plataforma', value: `${takeRate.toFixed(1).replace('.', ',')}%`, ...pctChange(takeRate, prevTakeRate) },
      { label: 'Ticket Médio', value: formatUsd(ticket), ...pctChange(ticket, prevTicket) },
    ];
  }

  async getRevenueBreakdown(agencyId: string): Promise<RevenueBreakdownItem[]> {
    const agencyObjectId = new Types.ObjectId(agencyId);
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

    const rows = await this.propostaModel.aggregate<{
      _id: { year: number; month: number };
      gmv: number;
      cost: number;
      markup: number;
      platformFee: number;
      agencyProfit: number;
    }>([
      {
        $match: {
          agencyId: agencyObjectId,
          status: PropostaStatus.APPROVED,
          createdAt: { $gte: from },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          gmv: { $sum: '$totalSaleUsd' },
          cost: { $sum: '$totalCostUsd' },
          markup: { $sum: '$totalMarkupUsd' },
          platformFee: { $sum: '$platformFeeUsd' },
          agencyProfit: { $sum: '$agencyProfitUsd' },
        },
      },
    ]);

    const byKey = new Map(rows.map((r) => [`${r._id.year}-${r._id.month}`, r]));
    const result: RevenueBreakdownItem[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const row = byKey.get(`${y}-${m}`);
      result.push({
        month: MONTH_LABELS_PT[m - 1],
        gmv: row?.gmv ?? 0,
        cost: row?.cost ?? 0,
        markup: row?.markup ?? 0,
        platformFee: row?.platformFee ?? 0,
        agencyProfit: row?.agencyProfit ?? 0,
      });
    }
    return result;
  }

  async getEngagementTrends(agencyId: string): Promise<EngagementBucket[]> {
    const agencyObjectId = new Types.ObjectId(agencyId);
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

    const rows = await this.propostaModel.aggregate<{
      _id: { year: number; month: number };
      total: number;
    }>([
      {
        $match: {
          agencyId: agencyObjectId,
          createdAt: { $gte: from },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
    ]);

    const byKey = new Map(rows.map((r) => [`${r._id.year}-${r._id.month}`, r.total]));
    const result: EngagementBucket[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const total = byKey.get(`${y}-${m}`) ?? 0;
      result.push({
        month: `${y}-${String(m).padStart(2, '0')}`,
        label: MONTH_LABELS_PT[m - 1],
        email: 0,
        whatsapp: 0,
        phone: 0,
        total,
      });
    }
    return result;
  }
}
