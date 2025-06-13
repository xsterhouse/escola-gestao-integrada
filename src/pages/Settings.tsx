
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolTab } from "@/components/settings/SchoolTab";
import { PurchasingCenterTab } from "@/components/settings/PurchasingCenterTab";
import { PermissionsTab } from "@/components/settings/PermissionsTab";
import { SystemUsersTab } from "@/components/settings/SystemUsersTab";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("schools");
  const isMobile = useIsMobile();

  // Check if user is master, if not redirect
  if (user?.role !== "master") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout requireAuth={true} requiredPermission="8">
      <div className={`${isMobile ? 'px-3 py-4' : 'px-6 py-6'} flex flex-col gap-6`}>
        <div>
          <h1 className={`font-bold tracking-tight mb-2 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
            Configurações
          </h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Gerencie escolas, usuários e permissões do sistema.
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className={`${isMobile ? 'grid grid-cols-2 gap-1 w-full' : 'grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto'}`}>
            <TabsTrigger value="schools" className={isMobile ? 'text-xs px-2' : ''}>
              {isMobile ? 'Escolas' : 'Escolas'}
            </TabsTrigger>
            <TabsTrigger value="purchasing" className={isMobile ? 'text-xs px-2' : ''}>
              {isMobile ? 'Central' : 'Central de Compras'}
            </TabsTrigger>
            <TabsTrigger value="users" className={isMobile ? 'text-xs px-2' : ''}>
              {isMobile ? 'Usuários' : 'Usuários do Sistema'}
            </TabsTrigger>
            <TabsTrigger value="permissions" className={isMobile ? 'text-xs px-2' : ''}>
              {isMobile ? 'Permissões' : 'Permissões do Sistema'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schools">
            <SchoolTab />
          </TabsContent>
          
          <TabsContent value="purchasing">
            <PurchasingCenterTab />
          </TabsContent>
          
          <TabsContent value="users">
            <SystemUsersTab />
          </TabsContent>
          
          <TabsContent value="permissions">
            <PermissionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
