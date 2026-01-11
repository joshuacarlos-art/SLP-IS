// types/financialRecord.ts
export interface FinancialRecord {
  _id: string;
  project_id: string;
  record_date: string;
  record_type: 'income' | 'expense' | 'savings' | 'investment' | 'loan';
  category: string;
  description: string;
  amount: number;
  cash_on_bank: number;
  cash_on_hand: number;
  total_savings: number;
  verification_method: 'receipt' | 'invoice' | 'bank_statement' | 'oral' | 'other';
  is_profit_share: boolean;
  profit_share_period?: string;
  recorded_by: string;
  created_at: string;
  updated_at?: string; // Add this line
  archived: boolean;
}

export interface CreateFinancialRecordInput {
  project_id: string;
  record_date: string;
  record_type: 'income' | 'expense' | 'savings' | 'investment' | 'loan';
  category: string;
  description: string;
  amount: number;
  cash_on_bank: number;
  cash_on_hand: number;
  total_savings: number;
  verification_method: 'receipt' | 'invoice' | 'bank_statement' | 'oral' | 'other';
  is_profit_share: boolean;
  profit_share_period?: string;
  recorded_by: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  currentCashOnHand: number;
  currentCashOnBank: number;
  totalSavings: number;
  profitShareDistributed: number;
}