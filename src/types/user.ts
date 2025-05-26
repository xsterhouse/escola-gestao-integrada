
export interface Permission {
  id: string;
  name: string;
  hasAccess: boolean;
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
  grantedBy?: string; // ID do usuário que concedeu a permissão
  grantedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  matricula: string; // Número de matrícula para login
  email: string;
  role: string;
  schoolId: string | null;
  permissions: Permission[];
  modulePermissions?: UserModulePermission[]; // Novas permissões específicas por módulo
  status?: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
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
  schoolId: string | null;
  purchasingCenterIds?: string[];
  isLinkedToPurchasing: boolean;
  status: "active" | "blocked";
  modulePermissions?: UserModulePermission[];
  createdAt: Date;
  updatedAt: Date;
}
