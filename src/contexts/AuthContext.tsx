
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, School, Tenant } from "@/lib/types";
import { multiTenantService } from "@/services/multiTenantService";

interface AuthContextType {
  user: User | null;
  currentSchool: School | null;
  currentTenant: Tenant | null;
  availableSchools: School[];
  availableTenants: Tenant[];
  isAuthenticated: boolean;
  login: (credential: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  switchTenant: (tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function saveUserPassword(userId: string, password: string) {
  const passwords = JSON.parse(localStorage.getItem("userPasswords") || "{}");
  passwords[userId] = password;
  localStorage.setItem("userPasswords", JSON.stringify(passwords));
}

function getUserPassword(userId: string): string | null {
  const passwords = JSON.parse(localStorage.getItem("userPasswords") || "{}");
  return passwords[userId] || null;
}

interface SystemUser {
  id: string;
  name: string;
  matricula: string;
  email?: string;
  userType: "funcionario" | "central_compras" | "diretor_escolar" | "secretario";
  hierarchyLevel: number;
  schoolId: string | null;
  tenantId?: string;
  purchasingCenterIds?: string[];
  isLinkedToPurchasing: boolean;
  status: "active" | "blocked";
  dataScope: "school" | "purchasing_center" | "global";
  canCreateUsers: boolean;
  canManageSchool: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Initialize multi-tenant context
        if (parsedUser) {
          const tenants = multiTenantService.getUserTenants(parsedUser);
          setAvailableTenants(tenants);
          
          const lastTenantId = localStorage.getItem("currentTenantId");
          const selectedTenantId = lastTenantId && tenants.some(t => t.id === lastTenantId) 
            ? lastTenantId 
            : tenants[0]?.id;
            
          if (selectedTenantId) {
            multiTenantService.setContext(parsedUser, selectedTenantId);
            const tenant = multiTenantService.getTenantById(selectedTenantId);
            setCurrentTenant(tenant);
          }
        }
        
        loadUserSchools(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const loadUserSchools = (authUser: User) => {
    const schools: School[] = JSON.parse(localStorage.getItem('schools') || '[]');
    
    if (authUser.role === "master") {
      setAvailableSchools(schools);
      setCurrentSchool(schools.length > 0 ? schools[0] : null);
    } else if (authUser.userType === "central_compras" && authUser.purchasingCenterIds) {
      const purchasingCenters = JSON.parse(localStorage.getItem('purchasingCenters') || '[]');
      const userCenters = purchasingCenters.filter(pc => 
        authUser.purchasingCenterIds?.includes(pc.id)
      );
      
      const linkedSchoolIds = new Set<string>();
      userCenters.forEach(center => {
        center.schoolIds?.forEach(schoolId => linkedSchoolIds.add(schoolId));
      });
      
      const linkedSchools = schools.filter(school => linkedSchoolIds.has(school.id));
      setAvailableSchools(linkedSchools);
      setCurrentSchool(linkedSchools.length > 0 ? linkedSchools[0] : null);
    } else if (authUser.schoolId) {
      const userSchool = schools.find(school => school.id === authUser.schoolId);
      if (userSchool) {
        setAvailableSchools([userSchool]);
        setCurrentSchool(userSchool);
      }
    }
  };

  const login = async (credential: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`🔐 Tentando login para credencial: ${credential}`);
      
      // Check for master user FIRST
      if (credential === "master" && password === "master123") {
        console.log(`✅ Login master detectado!`);
        const masterUser: User = {
          id: "master",
          name: "Administrador Master",
          matricula: "master",
          email: "master@sistema.local",
          role: "master",
          userType: "master",
          hierarchyLevel: 1,
          schoolId: null,
          tenantId: null,
          permissions: [],
          status: "active",
          dataScope: "global",
          canCreateUsers: true,
          canManageSchool: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setUser(masterUser);
        localStorage.setItem("currentUser", JSON.stringify(masterUser));
        
        // Setup master tenant access
        const tenants = multiTenantService.getUserTenants(masterUser);
        setAvailableTenants(tenants);
        
        if (tenants.length > 0) {
          multiTenantService.setContext(masterUser, tenants[0].id);
          setCurrentTenant(tenants[0]);
        }
        
        loadUserSchools(masterUser);
        console.log(`✅ Login bem-sucedido para usuário master`);
        return true;
      }
      
      // Check by email
      const systemUsersByEmail = await findUserByEmail(credential);
      if (systemUsersByEmail) {
        return await authenticateUser(systemUsersByEmail, password);
      }
      
      // Check by matricula
      const systemUsersByMatricula = await findUserByMatricula(credential);
      if (systemUsersByMatricula) {
        return await authenticateUser(systemUsersByMatricula, password);
      }
      
      console.log(`❌ Usuário não encontrado para credencial: ${credential}`);
      return false;
    } catch (error) {
      console.error("Erro durante o login:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const findUserByEmail = async (email: string): Promise<SystemUser | null> => {
    const systemUsers: SystemUser[] = JSON.parse(localStorage.getItem('systemUsers') || '[]');
    return systemUsers.find(u => u.email === email && u.status === 'active') || null;
  };

  const findUserByMatricula = async (matricula: string): Promise<SystemUser | null> => {
    const systemUsers: SystemUser[] = JSON.parse(localStorage.getItem('systemUsers') || '[]');
    return systemUsers.find(u => u.matricula === matricula && u.status === 'active') || null;
  };

  const authenticateUser = async (systemUser: SystemUser, password: string): Promise<boolean> => {
    console.log(`👤 Usuário encontrado: ${systemUser.name}`);
    
    const storedPassword = getUserPassword(systemUser.id);
    if (!storedPassword || storedPassword !== password) {
      console.log(`❌ Senha incorreta para usuário: ${systemUser.name}`);
      return false;
    }

    const authUser: User = {
      id: systemUser.id,
      name: systemUser.name,
      matricula: systemUser.matricula,
      email: systemUser.email || `${systemUser.matricula}@sistema.local`,
      role: systemUser.userType === "central_compras" ? "admin" : "user",
      userType: systemUser.userType,
      hierarchyLevel: systemUser.hierarchyLevel,
      schoolId: systemUser.schoolId,
      tenantId: systemUser.tenantId,
      purchasingCenterIds: systemUser.purchasingCenterIds,
      permissions: [],
      status: "active",
      dataScope: systemUser.dataScope,
      canCreateUsers: systemUser.canCreateUsers,
      canManageSchool: systemUser.canManageSchool,
      lastLogin: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setUser(authUser);
    localStorage.setItem("currentUser", JSON.stringify(authUser));
    
    // Setup multi-tenant context
    const tenants = multiTenantService.getUserTenants(authUser);
    setAvailableTenants(tenants);
    
    if (tenants.length > 0) {
      const defaultTenantId = authUser.tenantId || authUser.schoolId || tenants[0].id;
      multiTenantService.setContext(authUser, defaultTenantId);
      const tenant = multiTenantService.getTenantById(defaultTenantId);
      setCurrentTenant(tenant);
    }
    
    loadUserSchools(authUser);
    console.log(`✅ Login bem-sucedido para usuário: ${authUser.name}`);
    return true;
  };

  const switchTenant = (tenantId: string) => {
    if (!user) return;
    
    try {
      multiTenantService.setContext(user, tenantId);
      const tenant = multiTenantService.getTenantById(tenantId);
      setCurrentTenant(tenant);
      
      // Update current school if needed
      if (tenant) {
        const schools: School[] = JSON.parse(localStorage.getItem('schools') || '[]');
        const tenantSchool = schools.find(s => s.id === tenantId);
        if (tenantSchool) {
          setCurrentSchool(tenantSchool);
        }
      }
    } catch (error) {
      console.error("Error switching tenant:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentSchool(null);
    setCurrentTenant(null);
    setAvailableSchools([]);
    setAvailableTenants([]);
    localStorage.removeItem("currentUser");
    multiTenantService.clearContext();
    console.log(`👋 Usuário deslogado`);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentSchool, 
      currentTenant,
      availableSchools, 
      availableTenants,
      isAuthenticated, 
      login, 
      logout, 
      isLoading,
      switchTenant
    }}>
      {children}
    </AuthContext.Provider>
  );
}
