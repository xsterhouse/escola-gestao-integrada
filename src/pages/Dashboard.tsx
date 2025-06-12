
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { ActionCards } from "@/components/dashboard/ActionCards";
import { DanfeConsultModule } from "@/components/dashboard/DanfeConsultModule";
import { FinancialChartsModule } from "@/components/dashboard/FinancialChartsModule";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Bem-vindo ao sistema de gestão escolar</p>
          </div>
        </div>

        {/* Cards do Dashboard */}
        <DashboardCards />

        {/* Módulos de ação */}
        <ActionCards />

        {/* Módulos avançados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DanfeConsultModule />
          <FinancialChartsModule />
        </div>
      </div>
    </AppLayout>
  );
}
