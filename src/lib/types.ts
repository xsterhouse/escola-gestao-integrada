

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
  invoiceId?: string;
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
  name: string;
  endereco: string;
  telefone: string;
  email: string;
  address?: string; // Alias for endereco
  phone?: string; // Alias for telefone
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
  productId?: string;
  productName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
  unitOfMeasure: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Invoice {
  id: string;
  number?: string;
  danfeNumber: string;
  supplierId: string;
  supplier: Supplier;
  issueDate: Date;
  dueDate?: Date;
  totalValue: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  items: InvoiceItem[];
  xmlContent?: string;
  isActive?: boolean;
  financialProgramming?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceData {
  id: string;
  number: string;
  supplier: Supplier;
  dataEmissao: Date;
  numeroDanfe: string;
  valorTotal: number;
  items: InvoiceItem[];
}

// Inventory related types
export interface InventoryMovement {
  id: string;
  productId?: string;
  productName?: string;
  productDescription: string;
  movementType?: 'entrada' | 'saida';
  type: 'entrada' | 'saida';
  quantity: number;
  unitPrice: number;
  totalValue?: number;
  totalCost: number;
  reason?: string;
  invoiceId?: string;
  date: Date;
  createdBy?: string;
  source: 'manual' | 'invoice' | 'system';
  unitOfMeasure: string;
  requestId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryReport {
  id?: string;
  name?: string;
  type?: 'estoque' | 'movimentacao';
  generatedAt?: Date;
  generatedBy?: string;
  data?: any;
  productName?: string;
  productCode?: string;
  // Additional properties used in components
  lastEntryDate?: Date;
  supplierCode?: string;
  supplierName?: string;
  currentQuantity?: number;
  unitCost?: number;
  totalCost?: number;
}

export interface PurchaseReport {
  id?: string;
  name?: string;
  type?: 'compras';
  generatedAt?: Date;
  generatedBy?: string;
  data?: any;
  description?: string;
  productCode?: string;
  // Additional properties used in components
  supplier?: string;
  entryDate?: Date;
  quantity?: number;
  unitOfMeasure?: string;
  value?: number;
  currentBalance?: number;
}

export interface DeletionHistory {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  deletedAt: Date;
  deletedBy: string;
  reason: string;
  danfeNumber?: string;
  supplierName?: string;
  supplierCnpj?: string;
  totalValue?: number;
  issueDate?: Date;
  items?: any[];
}

// Dashboard related types
export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  type: 'currency' | 'number' | 'percentage';
  trend: 'up' | 'down' | 'stable';
  change: number;
  icon?: string;
  additionalInfo?: string;
  color?: string;
}

// Financial reports types
export interface FinancialReportFilter {
  startDate?: Date;
  endDate?: Date;
  accountType?: string;
  status?: string;
}

// Planning related types
export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  cnpj?: string;
  responsibleName?: string;
  tradingName?: string;
  director?: string;
  cityState?: string;
  logo?: string;
  purchasingCenterId?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ATAItem {
  id: string;
  nome: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  descricao?: string;
  saldoDisponivel: number;
}

export interface ATAContract {
  id: string;
  schoolId: string;
  numeroProcesso: string;
  fornecedor: string;
  dataATA: Date;
  dataInicioVigencia: Date;
  dataFimVigencia: Date;
  observacoes?: string;
  items: ATAItem[];
  status: 'ativo' | 'encerrado' | 'vencido' | 'liquidado';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanningItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  description?: string;
  availableQuantity?: number;
  planningId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Portuguese aliases for compatibility
  nome?: string;
  unidade?: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
  descricao?: string;
  saldoDisponivel?: number;
}

export interface Planning {
  id: string;
  schoolId: string;
  ataNumber?: string;
  status: 'draft' | 'finalized';
  items?: PlanningItem[];
  finalizedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  finalizedAt?: Date;
}

// Product related types
export interface Product {
  id: string;
  item?: number;
  name?: string;
  description: string;
  code?: string;
  category?: string;
  unit: string;
  quantity?: string;
  unitPrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  supplier?: string;
  barcode?: string;
  isActive?: boolean;
  familyAgriculture: boolean;
  indication?: string;
  restriction?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface Permission {
  id: string;
  name: string;
  hasAccess: boolean;
}

export interface DetailedPermission {
  moduleId: string;
  moduleName: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  read: boolean;
}

export interface ModuleRestriction {
  schoolOnly?: boolean;
  purchasingCenterOnly?: boolean;
  readOnly?: boolean;
  createOnly?: boolean;
  updateOnly?: boolean;
  deleteOnly?: boolean;
}

export interface UserModulePermission {
  userId: string;
  moduleId: string;
  hasAccess: boolean;
  restrictions?: ModuleRestriction;
  grantedBy?: string;
  grantedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  matricula: string;
  email: string;
  role: string;
  profileId?: string;
  schoolId: string | null;
  permissions: Permission[];
  modulePermissions?: UserModulePermission[];
  status?: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  detailedPermissions: DetailedPermission[];
  moduleAccess?: {
    [moduleId: string]: {
      hasAccess: boolean;
      restrictions?: ModuleRestriction;
    };
  };
}

export interface SystemUser {
  id: string;
  name: string;
  matricula: string;
  password: string;
  profileId?: string;
  schoolId: string | null;
  purchasingCenterIds?: string[];
  isLinkedToPurchasing: boolean;
  status: "active" | "blocked";
  modulePermissions?: UserModulePermission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModulePermission {
  id: string;
  name: string;
  description: string;
  hasAccess: boolean;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface PurchasingCenter {
  id: string;
  name: string;
  code: string;
  description?: string;
  schoolIds?: string[];
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferRecord {
  id: string;
  fromSchoolId: string;
  toSchoolId: string;
  planningId: string;
  transferredAt: Date;
  transferredBy: string;
  items: PlanningItem[];
  notes?: string;
}
