
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
}

export interface UserModulePermission {
  userId: string;
  moduleId: string;
  hasAccess: boolean;
  restrictions?: ModuleRestriction;
  grantedBy?: string;
  grantedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  matricula: string;
  email: string;
  role: string;
  profileId?: string; // New field to link to user profile
  schoolId: string | null;
  permissions: Permission[];
  modulePermissions?: UserModulePermission[];
  status?: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  detailedPermissions: DetailedPermission[]; // New detailed permissions
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
  profileId?: string; // New field to link to user profile
  schoolId: string | null;
  purchasingCenterIds?: string[];
  isLinkedToPurchasing: boolean;
  status: "active" | "blocked";
  modulePermissions?: UserModulePermission[];
  createdAt: Date;
  updatedAt: Date;
}
