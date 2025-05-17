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
  createdAt: Date;
  updatedAt: Date;
}

// Add the status field to the User interface
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
