import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, School } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface PurchasingCenter {
  id: string;
  name: string;
  schoolIds: string[];
}

type AuthContextType = {
  user: User | null;
  currentSchool: School | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (matricula: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  setCurrentSchool: (school: School) => void;
  availableSchools: School[];
  userPurchasingCenters: PurchasingCenter[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for the demo - agora com hierarquia
const MOCK_MASTER_USER: User = {
  id: "1",
  name: "Admin Master",
  matricula: "ADMIN001",
  email: "admin@sigre.net.br",
  role: "master",
  userType: "master",
  hierarchyLevel: 1,
  schoolId: null,
  dataScope: "global",
  canCreateUsers: true,
  canManageSchool: true,
  permissions: [
    { id: "1", name: "dashboard", hasAccess: true },
    { id: "2", name: "products", hasAccess: true },
    { id: "3", name: "inventory", hasAccess: true },
    { id: "4", name: "financial", hasAccess: true },
    { id: "5", name: "planning", hasAccess: true },
    { id: "6", name: "contracts", hasAccess: true },
    { id: "7", name: "accounting", hasAccess: true },
    { id: "8", name: "settings", hasAccess: true },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Função para obter senhas dos usuários do localStorage
const getUserPasswords = (): Record<string, string> => {
  const stored = localStorage.getItem("userPasswords");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing stored user passwords:", error);
    }
  }
  return {};
};

// Função para salvar senha do usuário
export const saveUserPassword = (userId: string, password: string) => {
  const passwords = getUserPasswords();
  passwords[userId] = password;
  localStorage.setItem("userPasswords", JSON.stringify(passwords));
  console.log(`🔐 Senha salva para usuário ID: ${userId}`);
};

// Function to get schools from localStorage or initialize with mock data
const getStoredSchools = (): School[] => {
  const stored = localStorage.getItem("schools");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing stored schools:", error);
    }
  }
  
  // Default mock schools if nothing in localStorage
  const defaultSchools: School[] = [
    {
      id: "1",
      name: "Escola Municipal João da Silva",
      code: "ESC001",
      address: "Rua das Flores, 123 - Centro",
      phone: "(11) 1234-5678",
      email: "contato@joaodasilva.edu.br",
      cnpj: "12.345.678/0001-90",
      responsibleName: "Maria Oliveira",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Colégio Estadual Paulo Freire",
      code: "ESC002",
      address: "Av. Paulo Freire, 456 - Cidade Nova",
      phone: "(11) 5678-9012",
      email: "contato@paulofreire.edu.br",
      cnpj: "98.765.432/0001-10",
      responsibleName: "Carlos Santos",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "Escola Municipal Maria José",
      code: "ESC003",
      address: "Rua Maria José, 789 - Vila Verde",
      phone: "(11) 9012-3456",
      email: "contato@mariajose.edu.br",
      cnpj: "45.678.901/0001-23",
      responsibleName: "Pedro Alves",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  // Save default schools to localStorage
  localStorage.setItem("schools", JSON.stringify(defaultSchools));
  return defaultSchools;
};

// Function to get purchasing centers from localStorage
const getStoredPurchasingCenters = (): PurchasingCenter[] => {
  const stored = localStorage.getItem("purchasingCenters");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing stored purchasing centers:", error);
    }
  }
  return [];
};

// Function to get users from localStorage or initialize with mock data
const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem("users");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing stored users:", error);
    }
  }
  
  // Default mock users com nova hierarquia
  const defaultUsers: User[] = [
    {
      id: "2",
      name: "João Silva",
      matricula: "ESC001",
      email: "joao@escola1.com",
      role: "admin",
      userType: "diretor_escolar",
      hierarchyLevel: 2,
      schoolId: "1",
      dataScope: "school",
      canCreateUsers: true,
      canManageSchool: true,
      permissions: [
        { id: "1", name: "dashboard", hasAccess: true },
        { id: "2", name: "products", hasAccess: true },
        { id: "3", name: "inventory", hasAccess: true },
        { id: "4", name: "financial", hasAccess: true }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "Maria Oliveira",
      matricula: "ESC002",
      email: "maria@escola2.com",
      role: "admin",
      userType: "diretor_escolar",
      hierarchyLevel: 2,
      schoolId: "2",
      dataScope: "school",
      canCreateUsers: true,
      canManageSchool: true,
      permissions: [
        { id: "1", name: "dashboard", hasAccess: true },
        { id: "2", name: "products", hasAccess: true },
        { id: "3", name: "inventory", hasAccess: true }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  
  // Save default users to localStorage
  localStorage.setItem("users", JSON.stringify(defaultUsers));
  return defaultUsers;
};

// Function to get system users from localStorage
const getStoredSystemUsers = () => {
  const stored = localStorage.getItem("systemUsers");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing stored system users:", error);
    }
  }
  return [];
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [userPurchasingCenters, setUserPurchasingCenters] = useState<PurchasingCenter[]>([]);

  // Check for saved authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("sigre_user");
    const savedSchool = localStorage.getItem("sigre_school");
    const savedPurchasingCenters = localStorage.getItem("sigre_user_purchasing_centers");
    
    // Initialize schools and users in localStorage if they don't exist
    getStoredSchools();
    getStoredUsers();
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      
      // Migrate old users to new hierarchy format
      if (!parsedUser.userType) {
        parsedUser.userType = parsedUser.role === "master" ? "master" : "diretor_escolar";
        parsedUser.hierarchyLevel = parsedUser.role === "master" ? 1 : 2;
        parsedUser.dataScope = parsedUser.role === "master" ? "global" : "school";
        parsedUser.canCreateUsers = parsedUser.role === "master" || parsedUser.role === "admin";
        parsedUser.canManageSchool = parsedUser.role === "master" || parsedUser.role === "admin";
      }
      
      setUser(parsedUser);
      
      // Initialize data isolation service
      import("@/services/dataIsolationService").then(({ dataIsolationService }) => {
        dataIsolationService.setContext(parsedUser);
      });
      
      // Get current schools from localStorage
      const currentSchools = getStoredSchools();
      
      // Set available schools based on user hierarchy
      if (parsedUser.userType === "master") {
        setAvailableSchools(currentSchools);
      } else if (parsedUser.schoolId) {
        const userSchool = currentSchools.find(school => school.id === parsedUser.schoolId);
        if (userSchool) {
          setAvailableSchools([userSchool]);
        }
      }
      
      // Restore user's purchasing centers if they exist
      if (savedPurchasingCenters) {
        try {
          const purchasingCenters = JSON.parse(savedPurchasingCenters);
          setUserPurchasingCenters(purchasingCenters);
          console.log(`🏢 Centrais de compras do usuário carregadas: ${purchasingCenters.length}`);
        } catch (error) {
          console.error("Error parsing saved purchasing centers:", error);
        }
      }
      
      if (savedSchool) {
        setCurrentSchool(JSON.parse(savedSchool));
      } else if (parsedUser.schoolId) {
        // If no saved school but user has a schoolId, set that as current
        const userSchool = currentSchools.find(school => school.id === parsedUser.schoolId);
        if (userSchool) {
          setCurrentSchool(userSchool);
          localStorage.setItem("sigre_school", JSON.stringify(userSchool));
        }
      }
    } else {
      // If no user logged in, still set available schools for login purposes
      const currentSchools = getStoredSchools();
      setAvailableSchools(currentSchools);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (matricula: string, password: string, remember: boolean) => {
    setIsLoading(true);
    
    try {
      // For demo purposes, we're using a mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`🔐 Tentativa de login - Matrícula: ${matricula}`);
      
      // Verificação das credenciais do admin master usando matrícula
      if (matricula === "ADMIN001" && password === "Sigre101020@") {
        console.log("✅ Login admin master realizado");
        setUser(MOCK_MASTER_USER);
        const currentSchools = getStoredSchools();
        setAvailableSchools(currentSchools);
        
        // Initialize data isolation service for master user
        const { dataIsolationService } = await import("@/services/dataIsolationService");
        dataIsolationService.setContext(MOCK_MASTER_USER);
        
        if (remember) {
          localStorage.setItem("sigre_user", JSON.stringify(MOCK_MASTER_USER));
        }
        
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao SIGRE!"
        });
        
        return;
      }
      
      // Check school users by matricula from localStorage
      const storedUsers = getStoredUsers();
      const userPasswords = getUserPasswords();
      
      console.log(`🔍 Procurando usuário com matrícula: ${matricula}`);
      console.log(`📊 Total de usuários armazenados: ${storedUsers.length}`);
      
      let schoolUser = storedUsers.find(user => user.matricula === matricula);
      
      // Se não encontrou nos usuários normais, procurar nos usuários do sistema
      if (!schoolUser) {
        const systemUsers = getStoredSystemUsers();
        console.log(`📊 Total de usuários do sistema: ${systemUsers.length}`);
        
        const systemUser = systemUsers.find((user: any) => user.matricula === matricula && user.status === "active");
        
        if (systemUser) {
          console.log(`👤 Usuário do sistema encontrado: ${systemUser.name} (ID: ${systemUser.id})`);
          console.log(`🏢 IDs das centrais vinculadas: ${JSON.stringify(systemUser.purchasingCenterIds)}`);
          
          // Converter usuário do sistema para formato User
          schoolUser = {
            id: systemUser.id,
            name: systemUser.name,
            matricula: systemUser.matricula,
            email: `${systemUser.matricula}@sigre.system`,
            role: "user",
            schoolId: systemUser.schoolId,
            userType: systemUser.userType || "funcionario",
            hierarchyLevel: systemUser.hierarchyLevel || 4,
            dataScope: systemUser.dataScope || "school",
            canCreateUsers: systemUser.canCreateUsers || false,
            canManageSchool: systemUser.canManageSchool || false,
            purchasingCenterIds: systemUser.purchasingCenterIds,
            permissions: [
              { id: "1", name: "dashboard", hasAccess: true },
              { id: "2", name: "products", hasAccess: systemUser.isLinkedToPurchasing },
              { id: "3", name: "inventory", hasAccess: systemUser.isLinkedToPurchasing },
              { id: "4", name: "financial", hasAccess: systemUser.isLinkedToPurchasing },
            ],
            createdAt: new Date(systemUser.createdAt),
            updatedAt: new Date(systemUser.updatedAt),
          };

          // Carregar TODAS as centrais de compras vinculadas ao usuário do sistema
          if (systemUser.purchasingCenterIds && systemUser.purchasingCenterIds.length > 0) {
            const allPurchasingCenters = getStoredPurchasingCenters();
            console.log(`📋 Total de centrais disponíveis: ${allPurchasingCenters.length}`);
            
            const userCenters = allPurchasingCenters.filter(center => {
              const isLinked = systemUser.purchasingCenterIds.includes(center.id);
              console.log(`🔗 Central ${center.name} (${center.id}) vinculada: ${isLinked}`);
              return isLinked;
            });
            
            console.log(`🏢 Centrais de compras vinculadas encontradas: ${userCenters.length}`);
            console.log(`🏢 Nomes das centrais: ${userCenters.map(c => c.name).join(', ')}`);
            
            setUserPurchasingCenters(userCenters);
            
            // Salvar centrais de compras do usuário para futuras sessões
            if (remember) {
              localStorage.setItem("sigre_user_purchasing_centers", JSON.stringify(userCenters));
              console.log(`💾 Centrais salvas no localStorage: ${userCenters.length}`);
            }
          } else {
            console.log(`⚠️ Usuário não possui centrais de compras vinculadas`);
            setUserPurchasingCenters([]);
          }
        }
      }
      
      if (schoolUser) {
        console.log(`👤 Usuário encontrado: ${schoolUser.name} (ID: ${schoolUser.id})`);
        
        // Migrate user to new hierarchy if needed
        if (!schoolUser.userType) {
          schoolUser.userType = schoolUser.role === "admin" ? "diretor_escolar" : "funcionario";
          schoolUser.hierarchyLevel = schoolUser.role === "admin" ? 2 : 4;
          schoolUser.dataScope = "school";
          schoolUser.canCreateUsers = schoolUser.role === "admin";
          schoolUser.canManageSchool = schoolUser.role === "admin";
        }
        
        // Initialize data isolation service
        const { dataIsolationService } = await import("@/services/dataIsolationService");
        dataIsolationService.setContext(schoolUser);
        
        // Verificar se existe senha salva para este usuário
        const storedPassword = userPasswords[schoolUser.id];
        
        console.log(`🔐 Senha armazenada existe: ${!!storedPassword}`);
        
        if (storedPassword && storedPassword === password) {
          console.log("✅ Senha validada com sucesso");
          
          setUser(schoolUser);
          
          // Find user's school from localStorage
          const currentSchools = getStoredSchools();
          const userSchool = currentSchools.find(school => school.id === schoolUser.schoolId);
          if (userSchool) {
            setCurrentSchool(userSchool);
            setAvailableSchools([userSchool]);
            
            if (remember) {
              localStorage.setItem("sigre_user", JSON.stringify(schoolUser));
              localStorage.setItem("sigre_school", JSON.stringify(userSchool));
            }
            
            toast({
              title: "Login realizado com sucesso",
              description: `Bem-vindo ao ambiente da ${userSchool.name}!`
            });
            
            return;
          } else {
            console.log("❌ Escola do usuário não encontrada");
          }
        } else {
          console.log("❌ Senha incorreta ou não definida");
        }
      } else {
        console.log("❌ Usuário não encontrado");
      }
      
      throw new Error("Credenciais inválidas");
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Erro de autenticação",
        description: "Matrícula ou senha incorretos",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear data isolation context
    import("@/services/dataIsolationService").then(({ dataIsolationService }) => {
      dataIsolationService.clearContext();
    });
    
    setUser(null);
    setCurrentSchool(null);
    setAvailableSchools([]);
    setUserPurchasingCenters([]);
    localStorage.removeItem("sigre_user");
    localStorage.removeItem("sigre_school");
    localStorage.removeItem("sigre_user_purchasing_centers");
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso."
    });
  };

  const handleSetCurrentSchool = (school: School) => {
    setCurrentSchool(school);
    localStorage.setItem("sigre_school", JSON.stringify(school));
    toast({
      title: "Escola selecionada",
      description: `Você está visualizando o ambiente da ${school.name}`,
    });
  };

  const value = {
    user,
    currentSchool,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setCurrentSchool: handleSetCurrentSchool,
    availableSchools,
    userPurchasingCenters,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
