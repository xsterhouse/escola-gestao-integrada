
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
