
export type UserRole = "master" | "admin" | "user" | "viewer";

export type ModulePermission = {
  id: string;
  name: string;
  hasAccess: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string | null;
  permissions: ModulePermission[];
  createdAt: Date;
  updatedAt: Date;
};

export type School = {
  id: string;
  name: string;
  cnpj: string;
  responsibleName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Module = {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
  requiredPermission: string;
};

export type DashboardMetric = {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
};
