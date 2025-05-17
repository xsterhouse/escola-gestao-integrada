import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, School } from "@/lib/types";

type AuthContextType = {
  user: User | null;
  currentSchool: School | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  setCurrentSchool: (school: School) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for the demo
const MOCK_MASTER_USER: User = {
  id: "1",
  name: "Admin Master",
  email: "admin@sigre.com",
  role: "master",
  schoolId: null,
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

// Mock school data
const MOCK_SCHOOLS: School[] = [
  {
    id: "1",
    name: "Escola Municipal João da Silva",
    cnpj: "12.345.678/0001-90",
    responsibleName: "Maria Oliveira",
    email: "contato@joaodasilva.edu.br",
    status: "active", // Adding the required status property
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Colégio Estadual Paulo Freire",
    cnpj: "98.765.432/0001-10",
    responsibleName: "Carlos Santos",
    email: "contato@paulofreire.edu.br",
    status: "active", // Adding the required status property
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("sigre_user");
    const savedSchool = localStorage.getItem("sigre_school");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedSchool) {
        setCurrentSchool(JSON.parse(savedSchool));
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    setIsLoading(true);
    
    try {
      // For demo purposes, we're using a mock authentication
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === "admin@sigre.com" && password === "password") {
        setUser(MOCK_MASTER_USER);
        
        if (remember) {
          localStorage.setItem("sigre_user", JSON.stringify(MOCK_MASTER_USER));
        }
        
        return;
      }
      
      throw new Error("Invalid credentials");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentSchool(null);
    localStorage.removeItem("sigre_user");
    localStorage.removeItem("sigre_school");
  };

  const handleSetCurrentSchool = (school: School) => {
    setCurrentSchool(school);
    localStorage.setItem("sigre_school", JSON.stringify(school));
  };

  const value = {
    user,
    currentSchool,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setCurrentSchool: handleSetCurrentSchool,
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
