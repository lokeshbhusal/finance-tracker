import { Timestamp } from '@angular/fire/firestore';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Timestamp;
  createdAt: Timestamp;
}

export interface Budget {
  id?: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM format
}

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Side Hustle',
  'Gift',
  'Other Income'
];

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Subscriptions',
  'Personal Care',
  'Other Expense'
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
