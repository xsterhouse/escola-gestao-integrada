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
  reconciliationStatus: 'pendente' | 'conciliado' | 'pgt_parcial';
  category?: string;
  resourceType?: string;
  source: 'payment' | 'receivable' | 'manual';
  documentId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Duplicate transaction control
  isDuplicate?: boolean;
  duplicateJustification?: string;
  // Partial payment control
  isPartialPayment?: boolean;
  partialAmount?: number;
  remainingAmount?: number;
  parentTransactionId?: string;
  originalReceivableId?: string;
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
  // Special flag for internal logic (not persisted)
  isCompletingPartialPayment?: boolean;
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
  status: 'ativo' | 'encerrado' | 'vencido' | 'liquidado' | 'divergencia_dados';
  items: ContractItem[];
  createdAt: Date;
  updatedAt: Date;
  // New fields for divergence tracking
  divergencias?: ContractDivergence[];
  ataValidated?: boolean;
  lastValidationAt?: Date;
}

export interface ContractDivergence {
  id: string;
  contractItemId: string;
  ataItemId: string;
  field: 'descricao' | 'unidade' | 'quantidade' | 'valorUnitario';
  valorContrato: string | number;
  valorATA: string | number;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  note?: string;
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
  // New fields for exit movements
  exitType?: string;
  destination?: string;
  documentReference?: string;
  // New fields for origin and destination tracking
  originSchoolId?: string;
  originSchoolName?: string;
  destinationId?: string;
  destinationName?: string;
  destinationType?: 'school' | 'purchasing_center';
  status?: 'entrada' | 'saida';
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
export interface PurchasingCenter {
  id: string;
  name: string;
  code: string;
  cnpj?: string;
  responsible?: string;
  address?: string;
  city?: string;
  description?: string;
  schoolIds?: string[];
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  purchasingCenterIds?: string[];
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
  hierarchyLevel?: number; // 1=master, 2=diretor, 3=secretario, 4=funcionario
}

export interface UserModulePermission {
  userId: string;
  moduleId: string;
  hasAccess: boolean;
  restrictions?: ModuleRestriction;
  grantedBy?: string;
  grantedAt?: Date;
}

export type UserHierarchy = 
  | "master" 
  | "diretor_escolar" 
  | "secretario" 
  | "central_compras" 
  | "funcionario";

export interface User {
  id: string;
  name: string;
  matricula: string;
  email: string;
  role: string;
  userType: UserHierarchy; // Nova propriedade para hierarquia
  hierarchyLevel: number; // 1=master, 2=diretor, 3=secretario, 4=funcionario
  profileId?: string;
  schoolId: string | null;
  purchasingCenterIds?: string[]; // Para usuários de central de compras
  permissions: Permission[];
  modulePermissions?: UserModulePermission[];
  status?: "active" | "inactive";
  canCreateUsers?: boolean; // Se pode criar usuários
  canManageSchool?: boolean; // Se pode gerenciar a escola
  dataScope?: "school" | "purchasing_center" | "global"; // Escopo dos dados
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Quem criou este usuário
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  hierarchyLevel: number;
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
  userType: UserHierarchy;
  hierarchyLevel: number;
  profileId?: string;
  schoolId: string | null;
  purchasingCenterIds?: string[];
  isLinkedToPurchasing: boolean;
  status: "active" | "blocked";
  modulePermissions?: UserModulePermission[];
  dataScope?: "school" | "purchasing_center" | "global";
  canCreateUsers?: boolean;
  canManageSchool?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
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

// New accounting-specific types
export interface AccountingEntry {
  id: string;
  schoolId: string;
  date: Date;
  debitAccount: string;
  debitValue: number;
  debitDescription: string;
  debitHistory: string; // Novo campo para histórico específico do débito
  creditAccount: string;
  creditValue: number;
  creditDescription: string;
  creditHistory: string; // Novo campo para histórico específico do crédito
  history: string; // Mantido para compatibilidade com dados existentes
  totalValue: number;
  entryType: 'manual' | 'automatic' | 'closing';
  sourceModule?: 'financial' | 'inventory' | 'contracts' | 'invoices';
  sourceDocumentId?: string;
  reconciled?: boolean;
  reconciledAt?: Date;
  reconciledBy?: string;
  auditTrail: AccountingAuditEntry[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface AccountingAccount {
  id: string;
  code: string;
  description: string;
  accountType: 'ativo' | 'passivo' | 'patrimonio_liquido' | 'receita' | 'despesa';
  accountClass: 'circulante' | 'nao_circulante' | 'realizavel_longo_prazo' | 'imobilizado' | 'intangivel';
  level: number;
  parentId?: string;
  isActive: boolean;
  allowsEntry: boolean;
  resourceTypes: string[];
  legislationReference?: string;
  balanceType: 'debtor' | 'creditor';
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountingAuditEntry {
  id: string;
  entryId: string;
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'reconciled';
  userId: string;
  userName: string;
  timestamp: Date;
  oldValues?: any;
  newValues?: any;
  reason?: string;
  ipAddress?: string;
}

export interface BankReconciliation {
  id: string;
  schoolId: string;
  bankAccountId: string;
  reconciliationDate: Date;
  startDate: Date;
  endDate: Date;
  bookBalance: number;
  bankBalance: number;
  adjustments: BankAdjustment[];
  reconciledItems: ReconciledItem[];
  status: 'in_progress' | 'completed' | 'reviewed';
  completedBy?: string;
  completedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAdjustment {
  id: string;
  reconciliationId: string;
  description: string;
  amount: number;
  type: 'bank_charge' | 'interest' | 'error_correction' | 'other';
  accountingEntryId?: string;
  createdAt: Date;
}

export interface ReconciledItem {
  id: string;
  reconciliationId: string;
  bankTransactionId: string;
  accountingEntryId: string;
  reconciledAmount: number;
  reconciledAt: Date;
  reconciledBy: string;
}

export interface AccountingReport {
  id: string;
  type: 'balancete' | 'livro_diario' | 'demonstracao_resultado' | 'balanco_patrimonial' | 'conciliacao_bancaria';
  schoolId: string;
  startDate: Date;
  endDate: Date;
  filters?: any;
  data?: any;
  generatedAt: Date;
  generatedBy: string;
  status: 'generating' | 'completed' | 'error';
}

export interface ClosingEntry {
  id: string;
  schoolId: string;
  exerciseYear: number;
  closingDate: Date;
  resultType: 'superavit' | 'deficit';
  resultAmount: number;
  entries: AccountingEntry[];
  validatedBy: string;
  validatedAt: Date;
  status: 'draft' | 'validated' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}
