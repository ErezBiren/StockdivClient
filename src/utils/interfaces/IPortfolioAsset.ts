import { DividendFrequencyEnum } from '../enums/DividendFrequencyEnum';
import { SectorEnum } from '../enums/SectorEnum';

export interface IPortfolioAsset {
  logoUrl: string;
  ticker: string;
  name: string;
  sector: SectorEnum;
  shares: number;
  averagePrice: number;
  sharePrice: number;
  invested: number;
  marketValue: number;
  income: number;
  dividendYield: number;
  yoc: number;
  dividendFrequency: keyof typeof DividendFrequencyEnum;
  profitLoss: number;
  profitLossPercent: number;
  annualized: number;
  dailyChange: number;
  dailyChangePercent: number;
  tax: number;
  lastExDay: string;
  lastPayDay: string;
  dividendAmount: number;
  lastTotalDividend: number;
  mvPortion: number;
  investedPortion: number;
}
