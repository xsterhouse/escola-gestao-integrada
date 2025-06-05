
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

export interface HierarchyConfig {
  level: number;
  name: string;
  description: string;
  canCreateUsers: boolean;
  canManageSchool: boolean;
  dataScope: "school" | "purchasing_center" | "global";
  allowedModules: string[];
  restrictions: ModuleRestriction[];
}
