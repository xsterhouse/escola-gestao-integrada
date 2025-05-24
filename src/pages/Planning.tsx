
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ATARegistrationTab } from "@/components/planning/ATARegistrationTab";
import { ATAValidityTab } from "@/components/planning/ATAValidityTab";
import { ATAReportsTab } from "@/components/planning/ATAReportsTab";
import { ClipboardList, Calendar, FileText } from "lucide-react";

const Planning = () => {
  const [activeTab, setActiveTab] = useState("registration");

  return (
    <AppLayout requireAuth requiredPermission="planning">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Atas de Registro de Preços</h2>
            <p className="text-muted-foreground">
              Gerencie ATAs de produtos alimentícios e transferências entre escolas
            </p>
          </div>
        </div>

        <Tabs defaultValue="registration" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="registration" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Registro de ATA
            </TabsTrigger>
            <TabsTrigger value="validity" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Vigência
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="registration" className="space-y-4">
            <ATARegistrationTab />
          </TabsContent>
          
          <TabsContent value="validity" className="space-y-4">
            <ATAValidityTab />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <ATAReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Planning;
