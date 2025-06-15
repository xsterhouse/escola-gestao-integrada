
export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  principal: string;
  vicePrincipal: string;
  city: string;
  state: string;
  zipCode: string;
  cnpj: string;
  isActive: boolean;
}

export interface PurchasingCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  city: string;
  state: string;
  zipCode: string;
  schoolIds: string[];
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  telefone?: string; // Added for compatibility
  email: string;
  contactPerson: string;
  city: string;
  state: string;
  zipCode: string;
  razaoSocial?: string;
  endereco?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unitOfMeasure: string;
  supplierId: string;
  categoryId: string;
  isActive: boolean;
  unit?: string;
  item?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  supplier: Supplier;
  items: InvoiceItem[];
  totalAmount: number;
  totalValue?: number;
  danfeNumber?: string;
  xmlContent?: string;
  supplierId?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  paymentStatus: 'pendente' | 'pago' | 'parcialmente_pago';
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  financialProgramming?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  totalPrice: number;
  invoiceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryReport {
  productCode: string;
  productName: string;
  lastEntryDate: string;
  supplierCode: string;
  supplierName: string;
  currentQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseReport {
  productCode: string;
  description: string;
  supplier: string;
  entryDate: string;
  quantity: number;
  unitOfMeasure: string;
  value: number;
  currentBalance: number;
}

export interface InventoryMovement {
  id: string;
  date: string;
  productDescription: string;
  quantity: number;
  unitOfMeasure: string;
  type: 'entrada' | 'saida';
  reason: string;
  unitPrice?: number;
  totalCost?: number;
  source?: 'manual' | 'invoice' | 'transfer';
  status?: 'entrada' | 'saida' | 'pendente';
  invoiceId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeletionHistory {
  id: string;
  entityType: 'product' | 'invoice' | 'movement';
  entityId: string;
  entityName: string;
  danfeNumber?: string;
  supplierName?: string;
  supplierCnpj?: string;
  issueDate?: string;
  totalValue?: number;
  items?: InvoiceItem[];
  deletedBy: string;
  deletedAt: string;
  reason: string;
  type?: 'product' | 'invoice' | 'movement';
  deletedItemId?: string;
  deletedItemDescription?: string;
}

// Multi-tenant types
export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  settings: TenantSettings;
}

export interface TenantSettings {
  allowTransfers: boolean;
  allowExternalAccess: boolean;
  requireApproval: boolean;
  maxUsers: number;
  modules: string[];
}

export type UserHierarchy = 'master' | 'diretor_escolar' | 'secretario' | 'funcionario' | 'central_compras';

export interface User {
  id: string;
  name: string;
  email: string;
  matricula?: string;
  role: 'admin' | 'manager' | 'employee' | 'master';
  userType: UserHierarchy;
  hierarchyLevel: number;
  schoolId?: string;
  tenantId?: string;
  purchasingCenterIds?: string[];
  permissions: string[];
  status: 'active' | 'blocked';
  dataScope: 'school' | 'purchasing_center' | 'global';
  canCreateUsers: boolean;
  canManageSchool: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserModulePermission {
  userId: string;
  moduleId: string;
  hasAccess: boolean;
  restrictions?: {
    readOnly?: boolean;
    schoolOnly?: boolean;
    purchasingCenterOnly?: boolean;
    approvalRequired?: boolean;
  };
}

// New interfaces for hierarchy configuration
export interface HierarchyConfig {
  level: number;
  name: string;
  description: string;
  canCreateUsers: boolean;
  canManageSchool: boolean;
  dataScope: 'global' | 'school' | 'purchasing_center';
  allowedModules: string[];
  restrictions: HierarchyRestriction[];
}

export interface HierarchyRestriction {
  schoolOnly?: boolean;
  readOnly?: boolean;
  purchasingCenterOnly?: boolean;
  approvalRequired?: boolean;
}

export interface SavedHierarchyConfigs {
  [key: string]: HierarchyConfig;
}

export interface ATAContract {
  id: string;
  numeroProcesso: string;
  fornecedor: string;
  dataATA: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  items: ATAItem[];
  createdBy: string;
  schoolId: string;
}

export interface ATAItem {
  id: string;
  numeroItem: string;
  descricaoProduto: string;
  descricao?: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  nome?: string;
  saldoDisponivel?: number;
}

// Financial and Accounting Types
export interface AccountingEntry {
  id: string;
  date: string;
  debitAccount: string;
  debitValue: number;
  debitDescription: string;
  creditAccount: string;
  creditValue: number;
  creditDescription: string;
  history: string;
  totalValue: number;
  entryType?: 'manual' | 'automatic';
  reconciled?: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  debitHistory?: string;
  creditHistory?: string;
  auditTrail?: any;
  createdAt: string;
  updatedAt?: string;
  tenantId?: string;
}

export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  reconciliationDate: string;
  startingBalance: number;
  endingBalance: number;
  transactions: BankTransaction[];
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  tenantId?: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  value: number;
  transactionType: 'credito' | 'debito';
  reconciliationStatus: 'conciliado' | 'pendente' | 'pgt_parcial';
  bankAccountId?: string;
  createdAt?: string;
  updatedAt?: string;
  isPartialPayment?: boolean;
  partialAmount?: number;
  isDuplicate?: boolean;
  remainingAmount?: number;
  source?: 'manual' | 'payment' | 'receivable';
  category?: string;
  resourceType?: string;
  duplicateJustification?: string;
  tenantId?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  agency: string;
  agencyNumber?: string;
  accountType: 'movimento' | 'aplicacao';
  managementType?: string;
  description?: string;
  initialBalance?: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  schoolId?: string;
  tenantId?: string;
}

export interface PaymentAccount {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  supplier: string;
  category: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'a_pagar' | 'pgt_parcial';
  paymentDate?: string;
  bankAccountId?: string;
  createdAt: string;
  updatedAt?: string;
  schoolId?: string;
  tenantId?: string;
  expenseType?: string;
  resourceCategory?: string;
  documentUrl?: string;
  invoiceId?: string;
  isDuplicate?: boolean;
}

export interface ReceivableAccount {
  id: string;
  description: string;
  value: number;
  originalValue?: number;
  receivedAmount?: number;
  isPartialPayment?: boolean;
  dueDate: string;
  source: string;
  category: string;
  status: 'pendente' | 'recebido' | 'cancelado';
  receivedDate?: string;
  bankAccountId?: string;
  createdAt: string;
  updatedAt?: string;
  schoolId?: string;
  tenantId?: string;
  origin?: string;
  expectedDate?: string;
  resourceType?: string;
  notes?: string;
  documentUrl?: string;
  parentReceivableId?: string;
}

// Fornecedor type for Brazilian system
export interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  endereco: string;
  telefone: string;
  email: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Contracts Types
export interface ContractData {
  id: string;
  numeroContrato: string;
  fornecedor: Fornecedor;
  dataInicio: string;
  dataFim: string;
  valor: number;
  status: 'ativo' | 'inativo' | 'suspenso' | 'divergencia_dados' | 'liquidado' | 'vencido' | 'encerrado';
  items: ContractItem[];
  contracts?: Contract[];
  totalItems?: number;
  hasDivergences?: boolean;
  divergencias?: ContractDivergence[];
  ataId?: string;
  ataValidated?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastValidationAt?: string;
  fornecedorId?: string;
}

export interface Contract {
  id: string;
  number: string;
  supplier: string;
  fornecedor?: string;
  startDate: string;
  endDate: string;
  dataInicio?: string;
  dataFim?: string;
  value: number;
  quantidade?: number;
  valorContratado?: number;
  status: 'active' | 'inactive' | 'suspended' | 'ativo' | 'vencido' | 'liquidado';
  items: ContractItem[];
  itensContratados?: string[];
}

export interface ContractItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  produto?: string;
  quantidadeContratada?: number;
  precoUnitario?: number;
  valorTotalContrato?: number;
  saldoValor?: number;
  valorPago?: number;
  quantidadePaga?: number;
  saldoQuantidade?: number;
  notasFiscais?: Record<string, number>;
  contractId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractFilter {
  status?: string;
  supplier?: string;
  fornecedor?: string;
  produto?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ContractDivergence {
  id: string;
  contractId: string;
  contractItemId?: string;
  itemId: string;
  field: string;
  type: 'price' | 'quantity' | 'specification';
  description: string;
  expectedValue: string;
  actualValue: string;
  valorContrato: string | number;
  valorATA: string | number;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolved?: boolean;
}

export interface ContractImportData {
  contracts: ContractData[];
  divergences: ContractDivergence[];
  importSummary: {
    total: number;
    successful: number;
    failed: number;
    warnings: number;
  };
}

export interface InvoiceData {
  id: string;
  number: string;
  supplier: string;
  issueDate: string;
  dueDate: string;
  totalValue: number;
  items: InvoiceItem[];
  xmlContent?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Dashboard Types
export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
  additionalInfo?: string;
}

// Planning Types
export interface PlanningItem {
  id: string;
  productName: string;
  description: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
  unitPrice?: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'approved' | 'purchased';
  name?: string;
  availableQuantity?: number;
}

export interface Planning {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  items: PlanningItem[];
  createdAt: string;
  updatedAt?: string;
}

// Financial Types
export interface FinancialSummary {
  totalReceivables: number;
  totalPayables: number;
  totalBankBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  paymentsToday?: number;
  receivablesToday?: number;
  monthlyRevenues?: number;
}

export interface FinancialReportFilter {
  startDate: string;
  endDate: string;
  accountType?: string;
  category?: string;
  status?: string;
}

// Transfer system for multi-tenant
export interface TransferRequest {
  id: string;
  type: 'balance' | 'stock';
  fromTenantId: string;
  toTenantId: string;
  fromSchoolId?: string;
  toSchoolId?: string;
  ataId?: string;
  amount?: number;
  items?: TransferItem[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
  reason: string;
}

export interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice?: number;
}

// Audit system
export interface AuditLog {
  id: string;
  userId: string;
  userType: UserHierarchy;
  action: string;
  resource: string;
  resourceId?: string;
  tenantId?: string;
  targetTenantId?: string;
  details: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}
