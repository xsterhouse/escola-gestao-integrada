import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Filter, Download, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { School } from "@/lib/types";

export function AccountingReportsTab() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    accountType: "all",
    resourceType: "all"
  });

  const [quarterFilters, setQuarterFilters] = useState({
    year: new Date().getFullYear().toString(),
    quarter: "1",
    schoolId: "all"
  });
  
  const [reportData, setReportData] = useState<any[]>([]);
  const [quarterData, setQuarterData] = useState<any>(null);
  const [reportType, setReportType] = useState("balancete");
  const { toast } = useToast();

  // Load schools from localStorage
  const { data: schools } = useLocalStorageSync<School>('schools', []);

  // Filter schools to ensure only valid schools with non-empty IDs are used
  const validSchools = schools.filter(school => school.id && school.id.trim() !== '');

  const accountTypes = [
    { value: "all", label: "Todos os tipos" },
    { value: "ativo", label: "Ativo" },
    { value: "passivo", label: "Passivo" },
    { value: "receita", label: "Receita" },
    { value: "despesa", label: "Despesa" },
    { value: "patrimonial", label: "Patrimonial" }
  ];

  const resourceTypes = [
    { value: "all", label: "Todos os recursos" },
    { value: "fundeb", label: "FUNDEB" },
    { value: "pnate", label: "PNATE" },
    { value: "pnae", label: "PNAE" },
    { value: "proprios", label: "Recursos Próprios" },
    { value: "outros", label: "Outros" }
  ];

  const quarters = [
    { value: "1", label: "1º Quadrimestre (Jan-Abr)" },
    { value: "2", label: "2º Quadrimestre (Mai-Ago)" },
    { value: "3", label: "3º Quadrimestre (Set-Dez)" }
  ];

  const years = [
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

  const generateReport = () => {
    if (!filters.startDate || !filters.endDate) {
      toast({
        title: "Período obrigatório",
        description: "Selecione o período para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    // Buscar dados dos lançamentos
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const accounts = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');

    const filteredEntries = entries.filter((entry: any) => {
      const entryDate = new Date(entry.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      return entryDate >= startDate && entryDate <= endDate;
    });

    if (reportType === "balancete") {
      const balanceData = accounts.map((account: any) => {
        const relatedEntries = filteredEntries.filter((entry: any) => 
          entry.debitDescription.includes(account.description) || 
          entry.creditDescription.includes(account.description)
        );

        const debitTotal = relatedEntries.reduce((sum: number, entry: any) => 
          entry.debitDescription.includes(account.description) ? sum + entry.debitValue : sum, 0
        );

        const creditTotal = relatedEntries.reduce((sum: number, entry: any) => 
          entry.creditDescription.includes(account.description) ? sum + entry.creditValue : sum, 0
        );

        return {
          code: account.code,
          description: account.description,
          type: account.type,
          debitTotal,
          creditTotal,
          balance: debitTotal - creditTotal
        };
      }).filter((item: any) => item.debitTotal > 0 || item.creditTotal > 0);

      setReportData(balanceData);
    } else {
      setReportData(filteredEntries);
    }

    toast({
      title: "Relatório gerado",
      description: `${reportType === "balancete" ? "Balancete" : "Relatório de lançamentos"} gerado com sucesso.`,
    });
  };

  const generateQuarterReport = () => {
    // Gerar dados do relatório quadrimestral baseado nos filtros
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const year = parseInt(quarterFilters.year);
    const quarter = parseInt(quarterFilters.quarter);
    
    // Definir período do quadrimestre
    const quarterPeriods = {
      1: { start: new Date(year, 0, 1), end: new Date(year, 3, 30) },
      2: { start: new Date(year, 4, 1), end: new Date(year, 7, 31) },
      3: { start: new Date(year, 8, 1), end: new Date(year, 11, 31) }
    };
    
    const period = quarterPeriods[quarter as keyof typeof quarterPeriods];
    
    // Filtrar lançamentos do período
    const quarterEntries = entries.filter((entry: any) => {
      const entryDate = new Date(entry.date);
      return entryDate >= period.start && entryDate <= period.end;
    });

    // Dados de gastos por categoria (simulados para demonstração)
    const categoryExpenses = [
      { category: "Alimentação", value: 45000, percentage: 35 },
      { category: "Material Didático", value: 25000, percentage: 20 },
      { category: "Transporte", value: 20000, percentage: 15 },
      { category: "Manutenção", value: 15000, percentage: 12 },
      { category: "Outros", value: 23000, percentage: 18 }
    ];

    // Dados de produtos alimentícios
    const foodProducts = [
      { product: "Arroz", quantity: 500, unit: "kg", value: 2500, supplier: "Fornecedor A" },
      { product: "Feijão", quantity: 300, unit: "kg", value: 1800, supplier: "Fornecedor B" },
      { product: "Carne", quantity: 200, unit: "kg", value: 3000, supplier: "Fornecedor C" },
      { product: "Verduras", quantity: 150, unit: "kg", value: 900, supplier: "Fornecedor D" }
    ];

    // Comparativo com quadrimestres anteriores
    const quarterComparison = [
      { quarter: "1º Quad", current: 128000, previous: 115000 },
      { quarter: "2º Quad", current: 135000, previous: 120000 },
      { quarter: "3º Quad", current: quarter === 3 ? 128000 : 0, previous: 118000 }
    ];

    // Execução orçamentária
    const budgetExecution = {
      totalBudget: 180000,
      totalSpent: 128000,
      percentage: 71.1,
      remaining: 52000
    };

    setQuarterData({
      period: `${quarter}º Quadrimestre de ${year}`,
      categoryExpenses,
      foodProducts,
      quarterComparison,
      budgetExecution,
      totalEntries: quarterEntries.length
    });

    toast({
      title: "Relatório Quadrimestre gerado",
      description: `Relatório quadrimestral gerado para ${quarter}º quadrimestre de ${year}.`,
    });
  };

  const exportReport = () => {
    const csvContent = reportType === "balancete" 
      ? "Código,Descrição,Tipo,Débito,Crédito,Saldo\n" + 
        reportData.map(item => `${item.code},${item.description},${item.type},${item.debitTotal},${item.creditTotal},${item.balance}`).join("\n")
      : "Data,Histórico,Débito,Crédito,Valor\n" +
        reportData.map(item => `${item.date},${item.history},${item.debitDescription},${item.creditDescription},${item.totalValue}`).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportQuarterPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "Relatório Quadrimestre será exportado em PDF...",
    });
    // Implementação da exportação PDF seria feita aqui
  };

  const exportQuarterXLSX = () => {
    toast({
      title: "Exportando XLSX",
      description: "Relatório Quadrimestre será exportado em Excel...",
    });
    // Implementação da exportação XLSX seria feita aqui
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="traditional" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="traditional">Relatórios Tradicionais</TabsTrigger>
          <TabsTrigger value="quarter">Relatório Quadrimestre</TabsTrigger>
        </TabsList>

        <TabsContent value="traditional" className="space-y-6">
          {/* Filtros Tradicionais */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <CardTitle className="text-xl text-gray-800">Relatórios Contábeis</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tipo de Relatório</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balancete">Balancete por Período</SelectItem>
                      <SelectItem value="lancamentos">Lançamentos por Período</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Data Inicial</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Data Final</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tipo de Conta</Label>
                  <Select value={filters.accountType} onValueChange={(value) => setFilters(prev => ({ ...prev, accountType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tipo de Recurso</Label>
                  <Select value={filters.resourceType} onValueChange={(value) => setFilters(prev => ({ ...prev, resourceType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por recurso" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map(resource => (
                        <SelectItem key={resource.value} value={resource.value}>
                          {resource.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateReport}
                  className="h-10 px-6 text-white font-semibold"
                  style={{ backgroundColor: '#041c43' }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
                
                {reportData.length > 0 && (
                  <Button
                    onClick={exportReport}
                    variant="outline"
                    className="h-10 px-6"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resultados Tradicionais */}
          {reportData.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">
                  {reportType === "balancete" ? "Balancete por Período" : "Lançamentos por Período"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {reportType === "balancete" ? (
                        <>
                          <TableHead>Código</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Débito</TableHead>
                          <TableHead className="text-right">Crédito</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>Data</TableHead>
                          <TableHead>Histórico</TableHead>
                          <TableHead>Débito</TableHead>
                          <TableHead>Crédito</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item, index) => (
                      <TableRow key={index}>
                        {reportType === "balancete" ? (
                          <>
                            <TableCell className="font-mono">{item.code}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="capitalize">{item.type}</TableCell>
                            <TableCell className="text-right">
                              {item.debitTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.creditTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {item.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{new Date(item.date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{item.history}</TableCell>
                            <TableCell>{item.debitDescription}</TableCell>
                            <TableCell>{item.creditDescription}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {item.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quarter" className="space-y-6">
          {/* Quarter Filters */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatório Quadrimestral
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Ano Letivo</Label>
                  <Select value={quarterFilters.year} onValueChange={(value) => setQuarterFilters(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Quadrimestre</Label>
                  <Select value={quarterFilters.quarter} onValueChange={(value) => setQuarterFilters(prev => ({ ...prev, quarter: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quarters.map(quarter => (
                        <SelectItem key={quarter.value} value={quarter.value}>
                          {quarter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Escola</Label>
                  <Select value={quarterFilters.schoolId} onValueChange={(value) => setQuarterFilters(prev => ({ ...prev, schoolId: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Escolas</SelectItem>
                      {validSchools.map(school => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={generateQuarterReport}
                    className="w-full h-10 px-6 text-white font-semibold"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Gerar Relatório Quadrimestre
                  </Button>
                </div>
              </div>

              {quarterData && (
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={exportQuarterPDF}
                    variant="outline"
                    className="h-10 px-6"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button
                    onClick={exportQuarterXLSX}
                    variant="outline"
                    className="h-10 px-6"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar XLSX
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultados Quadrimestre */}
          {quarterData && (
            <div className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-gray-600">Total Gasto</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {quarterData.budgetExecution.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-gray-600">% Execução</div>
                    <div className="text-2xl font-bold text-green-600">
                      {quarterData.budgetExecution.percentage}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-gray-600">Orçamento Total</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {quarterData.budgetExecution.totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-gray-600">Saldo Disponível</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {quarterData.budgetExecution.remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gastos por Categoria */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={quarterData.categoryExpenses}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percentage }) => `${category} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {quarterData.categoryExpenses.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Comparativo Quadrimestres */}
                <Card>
                  <CardHeader>
                    <CardTitle>Comparativo com Período Anterior</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={quarterData.quarterComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                        <Legend />
                        <Bar dataKey="current" fill="#16a34a" name="Atual" />
                        <Bar dataKey="previous" fill="#94a3b8" name="Anterior" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Tabelas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Produtos Alimentícios */}
                <Card>
                  <CardHeader>
                    <CardTitle>Produtos Alimentícios Adquiridos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Fornecedor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quarterData.foodProducts.map((product: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{product.product}</TableCell>
                            <TableCell>{product.quantity} {product.unit}</TableCell>
                            <TableCell>{product.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell>{product.supplier}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Gastos Detalhados por Categoria */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhamento por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>% Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quarterData.categoryExpenses.map((category: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{category.category}</TableCell>
                            <TableCell>{category.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell>{category.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
