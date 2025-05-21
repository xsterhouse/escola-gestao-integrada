
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ImportContract } from "@/components/planning/ImportContract";
import PlanningPage from "../components/planning/PlanningPage";
import { ClipboardList, FileText } from "lucide-react";

const Planning = () => {
  const [activeTab, setActiveTab] = useState("planning");

  return (
    <AppLayout requireAuth requiredPermission="planning">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Planejamento</h2>
            <p className="text-muted-foreground">
              Gerencie seus planejamentos de produtos e contratos
            </p>
          </div>
        </div>

        <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Planejamento
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contratos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="planning" className="space-y-4">
            <PlanningPage />
          </TabsContent>
          
          <TabsContent value="contracts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImportContract />
              
              <Card className="p-6 border-dashed border-2">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Consultar Contratos</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize e gerencie seus contratos existentes
                  </p>
                  <Button variant="outline" className="mt-2">Ver Contratos</Button>
                </div>
              </Card>
              
              <Card className="p-6 border-dashed border-2">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Relatórios</h3>
                  <p className="text-sm text-muted-foreground">
                    Gere relatórios personalizados de ATAs e contratos
                  </p>
                  <Button variant="outline" className="mt-2">Acessar Relatórios</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Planning;
