export interface BankAccount {
  id: string;
  schoolId: string;
  bankName: string;
  accountType: 'movimento' | 'aplicacao';
  agencyNumber: string;
  accountNumber: string;
  initialBalance: number;
  currentBalance: number;
  managementType?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransaction {
  id: string;
  schoolId: string;
  bankAccountId: string;
  date: Date;
  description: string;
  value: number;
  transactionType: 'credito' | 'debito';
  reconciliationStatus: 'pendente' | 'conciliado';
  category?: string;
  resourceType?: string;
  source: 'payment' | 'receivable' | 'manual';
  documentId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Duplicate transaction control
  isDuplicate?: boolean;
  duplicateJustification?: string;
}

export interface PaymentAccount {
  id: string;
  schoolId: string;
  description: string;
  dueDate: Date;
  value: number;
  status: 'a_pagar' | 'pago';
  paymentDate?: Date;
  bankAccountId?: string;
  resourceCategory: string;
  expenseType: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceivableAccount {
  id: string;
  schoolId: string;
  description: string;
  origin: string;
  expectedDate: Date;
  value: number;
  resourceType: string;
  status: 'pendente' | 'recebido';
  receivedDate?: Date;
  bankAccountId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // New fields for partial payments
  originalValue?: number;
  receivedAmount?: number;
  isPartialPayment?: boolean;
  parentReceivableId?: string;
}

export interface FinancialSummary {
  initialBalance: number;
  totalRevenues: number;
  totalExpenses: number;
  finalBalance: number;
  paymentsToday: number;
  receivablesToday: number;
  monthlyExpenses: number;
  monthlyRevenues: number;
}
