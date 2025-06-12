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
  createdAt: string;
  updatedAt: string;
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
  resourceType: string;
  notes: string;
  status: 'pendente' | 'recebido' | 'cancelado';
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

// Contract Types
export interface ContractData {
  id: string;
  ataId: string;
  fornecedor: Supplier;
  items: ContractItem[];
  status: 'ativo' | 'vencido' | 'suspenso';
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
}

export interface ContractItem {
  id: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  quantidadeUtilizada: number;
  saldoDisponivel: number;
}

export interface ContractFilter {
  fornecedor?: string;
  produto?: string;
  status?: string;
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
