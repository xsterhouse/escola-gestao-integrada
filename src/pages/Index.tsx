
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();
  
  useEffect(() => {
    // Set admin credentials in localStorage for demo purposes
    // In a real application, this would be handled through a proper registration flow
    if (window.localStorage.getItem("adminCredentialsSet") !== "true") {
      const adminUser = {
        id: "admin1",
        name: "Administrador Master",
        email: "admin@sigre.net.br",
        password: "Sigre101020@",
        role: "master",
        schoolId: null,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store in localStorage (this is just for demo purposes)
      window.localStorage.setItem("adminUser", JSON.stringify(adminUser));
      window.localStorage.setItem("adminCredentialsSet", "true");
    }

    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [isAuthenticated, isLoading, navigate, login]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-800">SIGRE</h1>
        <p className="text-xl text-gray-600">Sistema Integrado de Gestão de Recursos Escolares</p>
        <div className="mt-6 flex justify-center">
          <div className="border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full h-12 w-12 animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
