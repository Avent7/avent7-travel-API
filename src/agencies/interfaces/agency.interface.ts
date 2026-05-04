export interface IAgency {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'pro' | 'enterprise';
  brandConfig: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    customDomain?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
  pricingConfig: {
    defaultMarkupPct: number;
    platformTakeRatePct: number;
    minCommissionUsd: number;
    serviceFeeFixed: number;
    serviceFeeMode: 'fixed' | 'pct';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
