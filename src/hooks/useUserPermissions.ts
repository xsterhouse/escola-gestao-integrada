
import { useState, useEffect } from "react";
import { useLocalStorageSync } from "./useLocalStorageSync";
import { User, UserHierarchy, UserModulePermission } from "@/lib/types";
import { dataIsolationService } from "@/services/dataIsolationService";

export function useUserPermissions() {
  const { data: userPermissions, saveData: setUserPermissions } = useLocalStorageSync<UserModulePermission>('userModulePermissions', []);

  const hasPermission = (userId: string, moduleId: string): boolean => {
    const permission = userPermissions.find(p => p.userId === userId && p.moduleId === moduleId);
    return permission ? permission.hasAccess : false;
  };

  const setPermission = (userId: string, moduleId: string, hasAccess: boolean, restrictions?: UserModulePermission['restrictions']) => {
    const existingIndex = userPermissions.findIndex(p => p.userId === userId && p.moduleId === moduleId);
    
    if (existingIndex >= 0) {
      const updated = [...userPermissions];
      updated[existingIndex] = {
        ...updated[existingIndex],
        hasAccess,
        restrictions
      };
      setUserPermissions(updated);
    } else {
      const newPermission: UserModulePermission = {
        userId,
        moduleId,
        hasAccess,
        restrictions
      };
      setUserPermissions([...userPermissions, newPermission]);
    }

    dataIsolationService.logDataAccess('permission_update', 'module_permission', `${userId}_${moduleId}`);
  };

  const getUserPermissions = (userId: string) => {
    return userPermissions.filter(p => p.userId === userId);
  };

  const canAccessModule = (user: User, moduleId: string): boolean => {
    // Master users have access to everything
    if (user.userType === 'master') {
      return true;
    }

    // Check if module is available for user's hierarchy
    const availableModules = dataIsolationService.getAvailableModules();
    if (!availableModules.includes(moduleId)) {
      return false;
    }

    // Check specific user permissions
    const hasExplicitPermission = hasPermission(user.id, moduleId);
    
    // Apply hierarchy-based restrictions
    switch (moduleId) {
      case "8": // Configurações
        return user.userType === 'master' || (user.userType === 'diretor_escolar' && user.canManageSchool);
      case "7": // Contabilidade
        return user.userType === 'master';
      case "6": // Contratos
        return ['master', 'diretor_escolar', 'central_compras'].includes(user.userType) && hasExplicitPermission;
      case "4": // Financeiro
        return hasExplicitPermission && user.schoolId !== null;
      default:
        return hasExplicitPermission;
    }
  };

  const canCreateUser = (currentUser: User, targetUserType: UserHierarchy, targetSchoolId?: string): boolean => {
    return dataIsolationService.canCreateUser(targetUserType, targetSchoolId);
  };

  const canManageUser = (currentUser: User, targetUserId: string, targetUser: User): boolean => {
    return dataIsolationService.canManageUser(targetUserId, targetUser.hierarchyLevel);
  };

  const getModuleRestrictions = (userId: string, moduleId: string) => {
    const permission = userPermissions.find(p => p.userId === userId && p.moduleId === moduleId);
    return permission?.restrictions || {};
  };

  const getHierarchyConfig = (userType: UserHierarchy) => {
    const configs = {
      master: {
        level: 1,
        name: "Administrador Master",
        description: "Acesso total ao sistema",
        canCreateUsers: true,
        canManageSchool: true,
        dataScope: "global" as const,
        allowedModules: ["1", "2", "3", "4", "5", "6", "7", "8"],
        restrictions: []
      },
      diretor_escolar: {
        level: 2,
        name: "Diretor Escolar",
        description: "Gerencia a escola e cria usuários",
        canCreateUsers: true,
        canManageSchool: true,
        dataScope: "school" as const,
        allowedModules: ["1", "2", "3", "4", "5", "6", "8"],
        restrictions: [{ schoolOnly: true }]
      },
      secretario: {
        level: 3,
        name: "Secretário",
        description: "Operações administrativas da escola",
        canCreateUsers: false,
        canManageSchool: false,
        dataScope: "school" as const,
        allowedModules: ["1", "2", "3", "4", "5"],
        restrictions: [{ schoolOnly: true, readOnly: true }]
      },
      funcionario: {
        level: 4,
        name: "Funcionário",
        description: "Operações básicas da escola",
        canCreateUsers: false,
        canManageSchool: false,
        dataScope: "school" as const,
        allowedModules: ["1", "2", "3"],
        restrictions: [{ schoolOnly: true, readOnly: true }]
      },
      central_compras: {
        level: 3,
        name: "Central de Compras",
        description: "Gestão de compras para múltiplas escolas",
        canCreateUsers: false,
        canManageSchool: false,
        dataScope: "purchasing_center" as const,
        allowedModules: ["1", "2", "3", "4", "6"],
        restrictions: [{ purchasingCenterOnly: true }]
      }
    };

    return configs[userType];
  };

  return {
    userPermissions,
    hasPermission,
    setPermission,
    getUserPermissions,
    canAccessModule,
    canCreateUser,
    canManageUser,
    getModuleRestrictions,
    getHierarchyConfig
  };
}
