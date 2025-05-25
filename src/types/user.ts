
export interface Permission {
  id: string;
  name: string;
  hasAccess: boolean;
}

export interface User {
  id: string;
  name: string;
  matricula: string; // Número de matrícula para login
  email: string;
  role: string;
  schoolId: string | null;
  permissions: Permission[];
  status?: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
}
