
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface FinancialData {
  month: string;
  receitas: number;
  despesas: number;
  resultado: number;
}

interface DeficitData {
  name: string;
  value: number;
  color: string;
}

export function FinancialChartsModule() {
  const { currentSchool } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [deficitData, setDeficitData] = useState<DeficitData[]>([]);
  const [totalSuperavit, setTotalSuperavit] = useState(0);
  const [totalDeficit, setTotalDeficit] = useState(0);

  useEffect(() => {
    loadFinancialData();
  }, [currentSchool]);

  const loadFinancialData = () => {
    try {
      // Carregar contas a pagar
      const payableKey = currentSchool ? `payableAccounts_${currentSchool.id}` : 'payableAccounts';
      const payableData = JSON.parse(localStorage.getItem(payableKey) || '[]');
      
      // Carregar contas a receber
      const receivableKey = currentSchool ? `receivableAccounts_${currentSchool.id}` : 'receivableAccounts';
      const receivableData = JSON.parse(localStorage.getItem(receivableKey) || '[]');

      // Processar dados dos últimos 6 meses
      const monthsData = generateMonthlyData(receivableData, payableData);
      setFinancialData(monthsData);

      // Calcular totais
      const superavit = monthsData.reduce((acc, month) => acc + Math.max(0, month.resultado), 0);
      const deficit = monthsData.reduce((acc, month) => acc + Math.abs(Math.min(0, month.resultado)), 0);
      
      setTotalSuperavit(superavit);
      setTotalDeficit(deficit);

      // Dados para gráfico de déficit
      const deficitChartData = [
        { name: 'Despesas', value: deficit, color: '#ef4444' },
        { name: 'Receitas', value: superavit, color: '#22c55e' }
      ];
      setDeficitData(deficitChartData);

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  };

  const generateMonthlyData = (receivables: any[], payables: any[]): FinancialData[] => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = month.toISOString().slice(0, 7); // YYYY-MM
      
      // Calcular receitas do mês
      const monthReceitas = receivables
        .filter(item => item.dueDate?.startsWith(monthKey) && item.status === 'paid')
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      // Calcular despesas do mês
      const monthDespesas = payables
        .filter(item => item.dueDate?.startsWith(monthKey) && item.status === 'paid')
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      months.push({
        month: month.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas: monthReceitas,
        despesas: monthDespesas,
        resultado: monthReceitas - monthDespesas
      });
    }
    
    return months;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const superavitChartConfig = {
    receitas: {
      label: "Receitas",
      color: "#22c55e",
    },
    despesas: {
      label: "Despesas", 
      color: "#ef4444",
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Superávit</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalSuperavit)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">Últimos 6 meses</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Déficit</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalDeficit)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-xs text-red-600">Últimos 6 meses</span>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Receitas vs Despesas */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Receitas vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={superavitChartConfig} className="h-[300px]">
              <BarChart data={financialData}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                  />} 
                />
                <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição Financeira */}
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-purple-600" />
              Distribuição Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deficitData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {deficitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda personalizada */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Despesas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card className="border-t-4 border-t-gray-500">
        <CardHeader>
          <CardTitle className="text-lg">Análise Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Resultado Total</p>
              <p className={`text-xl font-bold ${totalSuperavit - totalDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalSuperavit - totalDeficit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Escola</p>
              <p className="text-lg font-medium">{currentSchool?.name || 'Não selecionada'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Período</p>
              <p className="text-lg font-medium">Últimos 6 meses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
