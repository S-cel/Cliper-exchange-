/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number; // percentage change (e.g., +2.45 or -3.12)
  sparkline: number[]; // relative historical points for mini-chart
  balance: number; // user's holding quantity
  fiatValue: number; // wallet balance * price
  color: string; // Tailwind tint color representation
  exchangeFeePercentage?: number;
}

export interface BankAccount {
  id: string;
  holderName: string;
  bankName: string;
  accountNumber: string;
  sortCode: string;
  balance: number;
  currency?: string;
  symbol?: string;
  country?: string;
}

export type TransactionType = 'BUY' | 'SELL' | 'SWAP' | 'TRANSFER' | 'GIFTCARD';

export interface GiftCard {
  id: string;
  name: string;
  rate: number;
  demand: string;
  icon: string;
  change24h: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // ISO string
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  assetSymbol?: string; // BTC, ETH, etc. (for BUY/SELL/SWAP)
  toAssetSymbol?: string; // For SWAP destination
  cryptoAmount?: number;
  fiatAmount: number; // Total amount in fiat (USD, GBP, EUR)
  fee: number;
  
  // Bank transfer specifics
  recipientName?: string;
  recipientBank?: string;
  recipientAccount?: string;
  recipientSortCode?: string;
  reference?: string;
  sourceBankAccountId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string; // ISO string
  suggestedAction?: {
    type: 'FILL_TRANSFER' | 'ADVISE_TRADE';
    data: any;
  };
}
