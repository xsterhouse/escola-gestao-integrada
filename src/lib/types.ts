
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
