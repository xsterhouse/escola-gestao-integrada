
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: (matricula: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (matricula: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`🔐 Tentando login para matrícula: ${matricula}`);
      
      // First check system users (escola e central de compras)
      const systemUsers: SystemUser[] = JSON.parse(localStorage.getItem('systemUsers') || '[]');
      const systemUser = systemUsers.find(u => u.matricula === matricula && u.status === 'active');
      
      if (systemUser) {
        console.log(`👤 Usuário do sistema encontrado: ${systemUser.name}`);
        console.log(`🏢 Tipo de usuário: ${systemUser.userType}`);
        console.log(`📊 Escopo de dados: ${systemUser.dataScope}`);
        
        const storedPassword = getUserPassword(systemUser.id);
        console.log(`🔑 Senha armazenada encontrada: ${!!storedPassword}`);
        
        if (storedPassword === password) {
          const authUser: User = {
            id: systemUser.id,
            name: systemUser.name,
            matricula: systemUser.matricula,
            email: `${systemUser.matricula}@sistema.local`,
            role: systemUser.userType === "central_compras" ? "admin" : "user",
            userType: systemUser.userType,
            hierarchyLevel: systemUser.hierarchyLevel,
            schoolId: systemUser.schoolId,
            purchasingCenterIds: systemUser.purchasingCenterIds,
            permissions: [],
            status: "active",
            dataScope: systemUser.dataScope,
            canCreateUsers: systemUser.canCreateUsers,
            canManageSchool: systemUser.canManageSchool,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          setUser(authUser);
          localStorage.setItem("currentUser", JSON.stringify(authUser));
          console.log(`✅ Login bem-sucedido para usuário do sistema: ${authUser.name}`);
          return true;
        } else {
          console.log(`❌ Senha incorreta para usuário do sistema`);
        }
      }
      
      // Then check regular users
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const regularUser = users.find(u => u.matricula === matricula);
      
      if (regularUser) {
        console.log(`👤 Usuário regular encontrado: ${regularUser.name}`);
        
        // For demo purposes, allow any password for regular users
        // In production, you would check against stored password
        const authUser: User = {
          ...regularUser,
          userType: regularUser.userType || "funcionario",
          hierarchyLevel: regularUser.hierarchyLevel || 4,
          dataScope: regularUser.dataScope || "school",
          canCreateUsers: regularUser.canCreateUsers || false,
          canManageSchool: regularUser.canManageSchool || false,
        };
        
        setUser(authUser);
        localStorage.setItem("currentUser", JSON.stringify(authUser));
        console.log(`✅ Login bem-sucedido para usuário regular: ${authUser.name}`);
        return true;
      }
      
      // Check for master user
      if (matricula === "master" && password === "master123") {
        const masterUser: User = {
          id: "master",
          name: "Administrador Master",
          matricula: "master",
          email: "master@sistema.local",
          role: "master",
          userType: "master",
          hierarchyLevel: 1,
          schoolId: null,
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
        console.log(`✅ Login bem-sucedido para usuário master`);
        return true;
      }
      
      console.log(`❌ Usuário não encontrado ou credenciais inválidas`);
      return false;
    } catch (error) {
      console.error("Erro durante o login:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    console.log(`👋 Usuário deslogado`);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
