
import { useState, useEffect } from "react";
import { useLocalStorageSync } from "./useLocalStorageSync";

interface UserModulePermission {
  userId: string;
  moduleId: string;
  hasAccess: boolean;
  restrictions?: {
    schoolOnly?: boolean;
    purchasingCenterOnly?: boolean;
    readOnly?: boolean;
  };
}

interface User {
  id: string;
  name: string;
  role: string;
  schoolId: string | null;
  type?: 'system' | 'regular';
}

export function useUserPermissions() {
  const { data: userPermissions, saveData: setUserPermissions } = useLocalStorageSync<UserModulePermission>('userModulePermissions', []);

  const hasPermission = (userId: string, moduleId: string): boolean => {
    const permission = userPermissions.find(p => p.userId === userId && p.moduleId === moduleId);
    return permission ? permission.hasAccess : false;
  };

  const setPermission = (userId: string, moduleId: string, hasAccess: boolean, restrictions?: UserModulePermission['restrictions']) => {
    const existingIndex = userPermissions.findIndex(p => p.userId === userId && p.moduleId === moduleId);
    
    if (existingIndex >= 0) {
      // Update existing permission
      const updated = [...userPermissions];
      updated[existingIndex] = {
        ...updated[existingIndex],
        hasAccess,
        restrictions
      };
      setUserPermissions(updated);
    } else {
      // Create new permission
      const newPermission: UserModulePermission = {
        userId,
        moduleId,
        hasAccess,
        restrictions
      };
      setUserPermissions([...userPermissions, newPermission]);
    }
  };

  const getUserPermissions = (userId: string) => {
    return userPermissions.filter(p => p.userId === userId);
  };

  const canAccessModule = (user: User, moduleId: string): boolean => {
    // Master users have access to everything
    if (user.role === 'master') {
      return true;
    }

    // Check specific user permissions
    const hasExplicitPermission = hasPermission(user.id, moduleId);
    
    // Apply role-based restrictions
    switch (moduleId) {
      case "8": // Configurações
        return user.role === 'master' || user.type === 'system';
      case "7": // Contabilidade
        return hasExplicitPermission && (user.role === 'admin' || user.role === 'master');
      case "4": // Financeiro
        return hasExplicitPermission && user.schoolId !== null;
      default:
        return hasExplicitPermission;
    }
  };

  const getModuleRestrictions = (userId: string, moduleId: string) => {
    const permission = userPermissions.find(p => p.userId === userId && p.moduleId === moduleId);
    return permission?.restrictions || {};
  };

  return {
    userPermissions,
    hasPermission,
    setPermission,
    getUserPermissions,
    canAccessModule,
    getModuleRestrictions
  };
}
