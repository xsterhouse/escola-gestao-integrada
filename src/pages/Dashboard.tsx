
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { ActionCards } from "@/components/dashboard/ActionCards";
import { DanfeConsultModule } from "@/components/dashboard/DanfeConsultModule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  return (
    <AppLayout requireAuth={true}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão escolar.
          </p>
        </div>
        
        <DashboardCards />
        
        <ActionCards />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="danfe">Consulta DANFE</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Empty state for future widgets */}
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  Widgets adicionais serão adicionados aqui conforme necessário.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="danfe" className="mt-6">
            <DanfeConsultModule />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
