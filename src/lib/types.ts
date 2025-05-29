
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
  supplier?: string;
  isDuplicate?: boolean;
  documentUrl?: string;
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
  documentUrl?: string;
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

// Contract related types
export interface Supplier {
  id: string;
  cnpj: string;
  razaoSocial: string;
  endereco: string;
  telefone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractItem {
  id: string;
  contractId: string;
  produto: string;
  quantidadeContratada: number;
  precoUnitario: number;
  valorTotalContrato: number;
  quantidadePaga: number;
  valorPago: number;
  saldoQuantidade: number;
  saldoValor: number;
  notasFiscais: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractData {
  id: string;
  numeroContrato: string;
  ataId?: string;
  fornecedorId: string;
  fornecedor: Supplier;
  dataInicio: Date;
  dataFim: Date;
  status: 'ativo' | 'encerrado' | 'vencido' | 'liquidado';
  items: ContractItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  fornecedor: string;
  itensContratados: string[];
  quantidade: number;
  valorContratado: number;
  dataInicio: Date;
  dataFim: Date;
  status: 'ativo' | 'vencido' | 'liquidado';
}

export interface ContractImportData {
  ataId: string;
  contractData: ContractData;
}

export interface ContractFilter {
  fornecedor?: string;
  produto?: string;
  status?: 'todos' | 'ativo' | 'encerrado' | 'vencido' | 'liquidado';
}

// Invoice related types
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  supplierId: string;
  supplier: Supplier;
  issueDate: Date;
  dueDate: Date;
  totalValue: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  items: InvoiceItem[];
  xmlContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceData {
  id: string;
  number: string;
  supplier: string;
  issueDate: Date;
  totalValue: number;
  items: InvoiceItem[];
}

// Inventory related types
export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: 'entrada' | 'saida';
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reason: string;
  invoiceId?: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryReport {
  id: string;
  name: string;
  type: 'estoque' | 'movimentacao';
  generatedAt: Date;
  generatedBy: string;
  data: any;
}

export interface PurchaseReport {
  id: string;
  name: string;
  type: 'compras';
  generatedAt: Date;
  generatedBy: string;
  data: any;
}

export interface DeletionHistory {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  deletedAt: Date;
  deletedBy: string;
  reason: string;
}

// Dashboard related types
export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  type: 'currency' | 'number' | 'percentage';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

// Financial reports types
export interface FinancialReportFilter {
  startDate?: Date;
  endDate?: Date;
  accountType?: string;
  status?: string;
}
