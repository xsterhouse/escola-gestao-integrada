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
  email: string;
  contactPerson: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unitOfMeasure: string;
  supplierId: string;
  categoryId: string;
  isActive: boolean;
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
  issueDate: Date;
  dueDate: Date;
  supplier: Supplier;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  paymentStatus: 'pendente' | 'pago' | 'parcialmente_pago';
  notes?: string;
  isActive: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  totalPrice: number;
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

export interface InventoryMovement {
  id: string;
  date: Date;
  productDescription: string;
  quantity: number;
  unitOfMeasure: string;
  type: 'entrada' | 'saida';
  reason: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  schoolId?: string;
  permissions: string[];
}

export interface ATAContract {
  id: string;
  numeroProcesso: string;
  fornecedor: string;
  dataATA: Date;
  dataInicioVigencia: Date;
  dataFimVigencia: Date;
  items: ATAItem[];
  createdBy: string;
  schoolId: string;
}

export interface ATAItem {
  id: string;
  numeroItem: string;
  descricaoProduto: string;
  descricao?: string; // Adding optional description field
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}
