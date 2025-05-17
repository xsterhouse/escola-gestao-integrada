
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
