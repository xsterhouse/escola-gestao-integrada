
import { useAuth } from "@/contexts/AuthContext";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { useMemo } from "react";

interface SystemUser {
  id: string;
  name: string;
  matricula: string;
  userType: "funcionario" | "central_compras";
  hierarchyLevel: number;
  schoolId: string | null;
  purchasingCenterIds?: string[];
  isLinkedToPurchasing: boolean;
  status: "active" | "blocked";
  dataScope: "school" | "purchasing_center";
  canCreateUsers: boolean;
  canManageSchool: boolean;
}

interface PurchasingCenter {
  id: string;
  name: string;
  schoolIds: string[];
}

interface School {
  id: string;
  name: string;
}

export function usePurchasingCenterAuth() {
  const { user } = useAuth();
  const { data: systemUsers } = useLocalStorageSync<SystemUser>('systemUsers', []);
  const { data: purchasingCenters } = useLocalStorageSync<PurchasingCenter>('purchasingCenters', []);
  const { data: schools } = useLocalStorageSync<School>('schools', []);

  const currentSystemUser = useMemo(() => {
    if (!user) return null;
    return systemUsers.find(sysUser => sysUser.matricula === user.matricula) || null;
  }, [user, systemUsers]);

  const isPurchasingCenterUser = useMemo(() => {
    return currentSystemUser?.userType === "central_compras";
  }, [currentSystemUser]);

  const userPurchasingCenters = useMemo(() => {
    if (!currentSystemUser?.purchasingCenterIds) return [];
    return purchasingCenters.filter(pc => 
      currentSystemUser.purchasingCenterIds?.includes(pc.id)
    );
  }, [currentSystemUser, purchasingCenters]);

  const linkedSchools = useMemo(() => {
    if (!isPurchasingCenterUser) {
      // For school users, return only their school
      if (currentSystemUser?.schoolId) {
        const school = schools.find(s => s.id === currentSystemUser.schoolId);
        return school ? [school] : [];
      }
      return [];
    }

    // For purchasing center users, return all schools linked to their centers
    const schoolIds = new Set<string>();
    userPurchasingCenters.forEach(pc => {
      pc.schoolIds?.forEach(schoolId => schoolIds.add(schoolId));
    });

    return schools.filter(school => schoolIds.has(school.id));
  }, [isPurchasingCenterUser, currentSystemUser, userPurchasingCenters, schools]);

  const canAccessSchool = (schoolId: string) => {
    if (!currentSystemUser) return false;
    
    // Master users can access everything
    if (user?.role === "master") return true;
    
    if (isPurchasingCenterUser) {
      // Purchasing center users can access schools linked to their centers
      return linkedSchools.some(school => school.id === schoolId);
    } else {
      // School users can only access their own school
      return currentSystemUser.schoolId === schoolId;
    }
  };

  const getDataScope = () => {
    if (!currentSystemUser) return "school";
    return currentSystemUser.dataScope;
  };

  const getAvailableModules = () => {
    if (!currentSystemUser) return [];
    
    if (isPurchasingCenterUser) {
      return ["1", "2", "3", "4", "6"]; // Dashboard, Produtos, Estoque, Financeiro, Planejamento
    } else {
      return ["1", "2", "3", "4", "5"]; // Dashboard, Produtos, Estoque, Financeiro, Relatórios
    }
  };

  const getUserContext = () => {
    return {
      systemUser: currentSystemUser,
      isPurchasingCenterUser,
      userPurchasingCenters,
      linkedSchools,
      dataScope: getDataScope(),
      availableModules: getAvailableModules(),
    };
  };

  return {
    currentSystemUser,
    isPurchasingCenterUser,
    userPurchasingCenters,
    linkedSchools,
    canAccessSchool,
    getDataScope,
    getAvailableModules,
    getUserContext,
  };
}
