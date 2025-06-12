
import { LucideIcon } from 'lucide-react';

// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  schoolId?: string;
  tenantId: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  tenantId: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  isActive: boolean;
  purchasingCenterIds?: string[];
  cnpj?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: LucideIcon;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  item: number;
  unit: string;
  unitOfMeasure: string;
  quantity?: number;
  unitPrice?: number;
  familyAgriculture: boolean;
  category: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

// Planning Types
export interface PlanningItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  priority: 'alta' | 'media' | 'baixa';
  status: 'planejado' | 'aprovado' | 'rejeitado';
  planningId: string;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Planning {
  id: string;
  name: string;
  description: string;
  period: string;
  status: 'rascunho' | 'ativo' | 'finalizado';
  totalBudget: number;
  usedBudget: number;
  items: PlanningItem[];
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

// ATA Types
export interface ATAItem {
  id: string;
  numeroItem: number;
  nome: string;
  descricaoProduto: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  descricao: string;
  saldoDisponivel: number;
}

export interface ATAContract {
  id: string;
  numeroAta: string;
  fornecedor: string;
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
  status: 'ativo' | 'vencido' | 'suspenso';
  items: ATAItem[];
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

// Financial Types
export interface PaymentAccount {
  id: string;
  schoolId: string;
  description: string;
  supplier: string;
  dueDate: string;
  value: number;
  expenseType: string;
  resourceCategory: string;
  category: string;
  status: 'a_pagar' | 'pago' | 'pgt_parcial' | 'cancelado' | 'pendente';
  createdAt: string;
  updatedAt: string;
}

export interface ReceivableAccount {
  id: string;
  schoolId: string;
  description: string;
  origin: string;
  source: string;
  category: string;
  expectedDate: string;
  dueDate: string;
  value: number;
  originalValue: number;
  receivedAmount: number;
  resourceType: string;
  notes: string;
  status: 'pendente' | 'recebido' | 'cancelado';
  isPartialPayment: boolean;
  receivedDate?: string;
  bankAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

// Bank Types
export interface BankAccount {
  id: string;
  schoolId: string;
  bankName: string;
  agency: string;
  agencyNumber: string;
  accountNumber: string;
  accountType: 'corrente' | 'poupanca' | 'movimento' | 'aplicacao';
  description: string;
  managementType: 'municipal' | 'terceirizada';
  balance: number;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  schoolId: string;
  bankAccountId: string;
  date: string;
  description: string;
  value: number;
  transactionType: 'credito' | 'debito';
  reconciliationStatus: 'pendente' | 'conciliado' | 'divergente';
  source: 'manual' | 'imported';
  isPartialPayment: boolean;
  partialAmount: number;
  isDuplicate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface InventoryMovement {
  id: string;
  type: 'entrada' | 'saida';
  date: string;
  productDescription: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  totalCost: number;
  source: 'manual' | 'invoice' | 'transfer';
  reason: string;
  status?: string;
  invoiceId?: string;
  requestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitOfMeasure: string;
  invoiceId: string;
  productId?: string;
  productName?: string;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceData {
  id: string;
  number: string;
  supplier: string;
  issueDate: string;
  dueDate: string;
  totalValue: number;
  items: InvoiceItem[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface Invoice {
  id: string;
  number: string;
  supplier: string;
  issueDate: string;
  dueDate: string;
  totalValue: number;
  items: InvoiceItem[];
  status: 'pending' | 'approved' | 'rejected';
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeletionHistory {
  id: string;
  type: 'invoice' | 'movement';
  entityId: string;
  reason: string;
  deletedBy: string;
  deletedAt: string;
  danfeNumber?: string;
  supplierName?: string;
  supplierCnpj?: string;
  issueDate?: string;
  totalValue?: number;
  items?: InvoiceItem[];
  metadata?: Record<string, any>;
}

// Supplier Types
export interface Supplier {
  id: string;
  cnpj: string;
  razaoSocial: string;
  name: string;
  endereco: string;
  address: string;
  telefone: string;
  phone: string;
  email: string;
  contactPerson: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Contract Divergence Types
export interface ContractDivergence {
  id: string;
  contractItemId: string;
  itemId: string;
  field: string;
  type: 'specification' | 'quantity' | 'price';
  description: string;
  expectedValue: string;
  actualValue: string;
  valorContrato: string | number;
  valorATA: string | number;
  status: 'pending' | 'resolved';
  contractId: string;
  createdAt: string;
}

// Contract Types
export interface ContractData {
  id: string;
  ataId: string;
  numeroContrato: string;
  fornecedor: Supplier;
  items: ContractItem[];
  status: 'ativo' | 'vencido' | 'suspenso' | 'liquidado' | 'divergencia_dados';
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
  divergencias?: ContractDivergence[];
  ataValidated?: boolean;
  lastValidationAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractItem {
  id: string;
  produto: string;
  description: string;
  quantidade: number;
  quantity: number;
  valorUnitario: number;
  unitPrice: number;
  valorTotal: number;
  totalPrice: number;
  quantidadeUtilizada: number;
  saldoDisponivel: number;
  quantidadeContratada: number;
  precoUnitario: number;
  valorTotalContrato: number;
  notasFiscais: any[];
  quantidadePaga: number;
  valorPago: number;
  saldoQuantidade: number;
  saldoValor: number;
  unit?: string;
  contractId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractImportData {
  id: string;
  ataId: string;
  contractData: ContractData;
  status: 'pending' | 'imported' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ContractFilter {
  fornecedor?: string;
  produto?: string;
  status?: string;
}

// Legacy Contract Types (for backward compatibility)
export interface Contract {
  id: string;
  number: string;
  fornecedor: string;
  numeroContrato: string;
  itensContratados: string[];
  quantidade: number;
  valorContratado: number;
  dataInicio: string;
  dataFim: string;
  status: 'ativo' | 'vencido' | 'liquidado';
}

// Accounting Types
export interface AccountingEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  debitValue: number;
  creditValue: number;
  entryType: 'manual' | 'automatic';
  reconciled: boolean;
  invoiceId?: string;
  history: string;
  totalValue: number;
  debitDescription: string;
  creditDescription: string;
  debitHistory: string;
  creditHistory: string;
  reconciledBy?: string;
  reconciledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankReconciliation {
  id: string;
  bankStatement: string;
  accountingEntry: string;
  reconciliationDate: string;
  status: 'reconciled' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  icon: LucideIcon;
  href: string;
  hasAccess: boolean;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netBalance: number;
}

export interface SchoolFinancialData {
  schoolId: string;
  schoolName: string;
  financialSummary: FinancialSummary;
}
