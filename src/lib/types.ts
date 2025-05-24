export interface Permission {
  id: string;
  name: string;
  hasAccess: boolean;
}

export interface School {
  id: string;
  name: string;
  cnpj: string;
  responsibleName: string;
  email: string;
  status: "active" | "suspended";
  address?: string;
  cityState?: string;
  phone?: string;
  tradingName?: string; // Nome Fantasia
  logo?: string; // Path to logo image
  director?: string; // Diretor(a)
  purchasingCenterId?: string; // Central de Compras
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string | null;
  permissions: Permission[];
  status?: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  icon: string;
  color: string;
  additionalInfo?: string;
}

export interface ModulePermission {
  id: string;
  name: string;
  description: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  hasAccess?: boolean; // Added for compatibility
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
}

export interface PurchasingCenter {
  id: string;
  name: string;
  description: string;
  schoolIds: string[]; // IDs of schools that are part of this purchasing center
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolUser {
  id: string;
  schoolId: string;
  userId: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product interface
export interface Product {
  id: string;
  item: number; // Item number (required)
  description: string; // Product description
  unit: string; // Unit of measure (Kg, Pct, etc)
  quantity?: string; // Optional quantity
  familyAgriculture: boolean; // Whether the product is from family agriculture
  indication?: string; // New field: Product indication
  restriction?: string; // New field: Product restriction
  createdAt: Date;
  updatedAt: Date;
}

// New inventory-related interfaces
export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Unified InvoiceItem interface - using English property names as standard
export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitOfMeasure: string; // Un, Pc, Kg, Gr, etc.
  invoiceId: string;
}

export interface Invoice {
  id: string;
  supplierId: string;
  supplier: Supplier;
  issueDate: Date;
  danfeNumber: string;
  totalValue: number;
  items: InvoiceItem[];
  financialProgramming?: string; // Added during XML import
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  type: 'entrada' | 'saida'; // Type of movement (in/out)
  date: Date;
  productDescription: string;
  quantity: number;
  unitOfMeasure: string; // Un, Pc, Kg, Gr, etc.
  unitPrice: number;
  totalCost: number;
  invoiceId?: string; // Reference to invoice if type is 'entrada'
  requestId?: string; // Reference to request if type is 'saida'
  source: 'manual' | 'invoice' | 'system'; // Source of the movement
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryReport {
  productCode: string;
  productName: string;
  lastEntryDate: Date;
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
  entryDate: Date;
  quantity: number;
  unitOfMeasure: string;
  value: number;
  currentBalance: number;
}

export interface DeletionRecord {
  id: string;
  entityType: string;
  entityId: string;
  entityData: string; // JSON string of deleted entity
  deletedBy: string; // User ID
  deletionReason: string;
  createdAt: Date;
}

// Financial Module Types
export interface BankAccount {
  id: string;
  schoolId: string;
  bankName: string;
  accountNumber: string;
  accountType: 'movimento' | 'aplicacao';
  description: string;
  initialBalance: number;
  currentBalance: number;
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
  reconciliationStatus: 'conciliado' | 'nao_conciliado';
  category?: string;
  resourceType?: string;
  documentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentAccount {
  id: string;
  schoolId: string;
  description: string;
  supplier: string;
  dueDate: Date;
  value: number;
  expenseType: string;
  resourceCategory: string;
  status: 'a_pagar' | 'pago';
  paymentDate?: Date;
  documentUrl?: string;
  invoiceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceivableAccount {
  id: string;
  schoolId: string;
  description: string;
  origin: string;
  resourceType: string;
  expectedDate: Date;
  value: number;
  status: 'recebido' | 'pendente';
  receivedDate?: Date;
  documentUrl?: string;
  contractId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReportFilter {
  startDate?: Date;
  endDate?: Date;
  resourceType?: string;
  expenseCategory?: string;
  status?: string;
  supplier?: string;
  origin?: string;
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

// Enum types for financial module
export type ResourceType = 'PNATE' | 'PNAE' | 'Recursos Próprios' | 'Outros';
export type ExpenseCategory = 'Alimentação' | 'Transporte' | 'Material Didático' | 'Infraestrutura' | 'Serviços' | 'Outros';

// Planning Module Types
export interface PlanningItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  description: string;
  planningId: string;
  createdAt: Date;
  updatedAt: Date;
  availableQuantity?: number; // For tracking transfers
}

export interface Planning {
  id: string;
  schoolId: string;
  status: "draft" | "finalized";
  ataNumber?: string;
  finalizedAt?: Date;
  finalizedBy?: string;
  items: PlanningItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferRecord {
  id: string;
  fromSchoolId: string;
  toSchoolId: string;
  planningItemId: string;
  quantity: number;
  transferredAt: Date;
  transferredBy: string;
  createdAt: Date;
}

// Contracts Module Types - Using unified supplier and invoice item types
export interface InvoiceData {
  id: string;
  supplier: {
    cnpj: string;
    razaoSocial: string;
    endereco: string;
    telefone?: string;
    email?: string;
  };
  dataEmissao: Date;
  numeroDanfe: string;
  valorTotal: number;
  items: InvoiceItem[]; // Now uses the unified InvoiceItem interface
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

export interface ContractSupplier {
  id: string;
  cnpj: string;
  razaoSocial: string;
  endereco?: string;
  telefone?: string;
  email?: string;
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
  notasFiscais: { [nfNumber: string]: number }; // NF number -> quantity paid
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractData {
  id: string;
  numeroContrato: string;
  fornecedorId: string;
  fornecedor: ContractSupplier;
  dataInicio: Date;
  dataFim: Date;
  status: 'ativo' | 'encerrado' | 'vencido' | 'liquidado';
  items: ContractItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractImportData {
  numeroContrato: string;
  fornecedor: string;
  vigencia: string;
  produtos: {
    nome: string;
    quantidade: number;
    precoUnitario: number;
    valorContrato: number;
    notasFiscais?: { [nfNumber: string]: number };
  }[];
}

export interface ContractFilter {
  fornecedor?: string;
  produto?: string;
  status?: 'ativo' | 'encerrado' | 'vencido' | 'liquidado' | 'todos';
  dataInicio?: Date;
  dataFim?: Date;
}

export interface ContractReport {
  tipo: 'abertos' | 'liquidados' | 'vencidos' | 'comparativo';
  dados: any[];
  geradoEm: Date;
}

export interface ATAItem {
  id: string;
  nome: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  descricao: string;
  saldoDisponivel: number;
}

export interface ATAContract {
  id: string;
  numeroProcesso: string;
  fornecedor: string;
  dataATA: Date;
  dataInicioVigencia: Date;
  dataFimVigencia: Date;
  observacoes: string;
  items: ATAItem[];
  status: "ativo" | "vencido" | "cancelado";
  schoolId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ATATransferRecord {
  id: string;
  fromSchoolId: string;
  toSchoolId: string;
  contractId: string;
  itemId: string;
  quantity: number;
  transferredAt: Date;
  transferredBy: string;
  justificativa: string;
}
