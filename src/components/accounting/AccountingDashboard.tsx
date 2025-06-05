
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { AccountingEntry, BankReconciliation } from "@/lib/types";

export function AccountingDashboard() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
  const [summary, setSummary] = useState({
    totalEntries: 0,
    automaticEntries: 0,
    manualEntries: 0,
    pendingReconciliation: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    currentBalance: 0,
    reconciliationRate: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const entriesData = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const reconciliationData = JSON.parse(localStorage.getItem('bankReconciliations') || '[]');
    
    setEntries(entriesData);
    setReconciliations(reconciliationData);
    
    calculateSummary(entriesData, reconciliationData);
  };

  const calculateSummary = (entriesData: AccountingEntry[], reconciliationData: BankReconciliation[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyEntries = entriesData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const totalRevenue = monthlyEntries
      .filter(entry => entry.creditAccount.startsWith('4')) // Contas de receita
      .reduce((sum, entry) => sum + entry.creditValue, 0);

    const totalExpenses = monthlyEntries
      .filter(entry => entry.debitAccount.startsWith('3')) // Contas de despesa
      .reduce((sum, entry) => sum + entry.debitValue, 0);

    const automaticCount = entriesData.filter(entry => entry.entryType === 'automatic').length;
    const pendingReconciliation = entriesData.filter(entry => !entry.reconciled).length;
    const reconciliationRate = entriesData.length > 0 
      ? ((entriesData.length - pendingReconciliation) / entriesData.length) * 100 
      : 0;

    setSummary({
      totalEntries: entriesData.length,
      automaticEntries: automaticCount,
      manualEntries: entriesData.length - automaticCount,
      pendingReconciliation,
      monthlyRevenue: totalRevenue,
      monthlyExpenses: totalExpenses,
      currentBalance: totalRevenue - totalExpenses,
      reconciliationRate
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Lançamentos</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalEntries}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {summary.automaticEntries} automáticos
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {summary.manualEntries} manuais
                  </Badge>
                </div>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receitas do Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.monthlyRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">Entrada</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesas do Mês</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.monthlyExpenses)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-xs text-red-600">Saída</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resultado do Mês</p>
                <p className={`text-2xl font-bold ${summary.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.currentBalance)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-600">
                    {summary.currentBalance >= 0 ? 'Superávit' : 'Déficit'}
                  </span>
                </div>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                summary.currentBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {summary.currentBalance >= 0 ? 
                  <TrendingUp className="h-5 w-5 text-green-600" /> : 
                  <TrendingDown className="h-5 w-5 text-red-600" />
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status da Conciliação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Status da Conciliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Taxa de Conciliação</span>
              <span className="text-sm font-bold text-gray-900">
                {summary.reconciliationRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={summary.reconciliationRate} className="h-2" />
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Conciliados</span>
              </div>
              <span className="text-sm font-medium">
                {summary.totalEntries - summary.pendingReconciliation}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Pendentes</span>
              </div>
              <span className="text-sm font-medium">{summary.pendingReconciliation}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Alertas e Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.pendingReconciliation > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    {summary.pendingReconciliation} lançamentos pendentes de conciliação
                  </p>
                  <p className="text-xs text-orange-600">
                    Recomenda-se conciliar regularmente para manter a integridade contábil
                  </p>
                </div>
              </div>
            )}

            {summary.currentBalance < 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Resultado negativo no mês atual
                  </p>
                  <p className="text-xs text-red-600">
                    Déficit de {formatCurrency(Math.abs(summary.currentBalance))}
                  </p>
                </div>
              </div>
            )}

            {summary.pendingReconciliation === 0 && summary.currentBalance >= 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Sistema contábil em dia
                  </p>
                  <p className="text-xs text-green-600">
                    Todas as conciliações estão atualizadas
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
