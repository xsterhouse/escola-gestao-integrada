
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, FileText, Download, AlertTriangle } from "lucide-react";
import { ContractData } from "@/lib/types";

interface ContractReportsSectionProps {
  contracts: ContractData[];
}

export function ContractReportsSection({ contracts }: ContractReportsSectionProps) {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportData, setReportData] = useState<any[]>([]);

  // Dados fictícios para escola e usuário (em um sistema real, viriam do contexto)
  const schoolInfo = {
    nome: "Escola Municipal João da Silva",
    usuario: "Maria Administradora"
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Data inválida';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      
      return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', date);
      return 'Data inválida';
    }
  };

  const generateReport = (reportType: string) => {
    switch (reportType) {
      case 'completo':
        const completo = contracts.map(contract => ({
          nomeEscola: schoolInfo.nome,
          nomeUsuario: schoolInfo.usuario,
          fornecedor: contract.fornecedor.razaoSocial,
          numeroProcesso: contract.numeroContrato,
          objetoContrato: contract.items.map(item => item.produto).join(', '),
          vigenciaInicio: contract.dataInicio,
          vigenciaFim: contract.dataFim,
          valorContrato: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0),
          status: contract.status,
          camposObrigatorios: {
            temFornecedor: !!contract.fornecedor.razaoSocial,
            temNumeroProcesso: !!contract.numeroContrato,
            temVigencia: !!(contract.dataInicio && contract.dataFim),
            temValor: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0) > 0
          }
        }));
        setReportData(completo);
        break;
        
      case 'abertos':
        const abertos = contracts.filter(c => c.status === 'ativo').map(contract => ({
          nomeEscola: schoolInfo.nome,
          nomeUsuario: schoolInfo.usuario,
          numeroProcesso: contract.numeroContrato,
          fornecedor: contract.fornecedor.razaoSocial,
          objetoContrato: contract.items.map(item => item.produto).join(', '),
          vigenciaInicio: contract.dataInicio,
          vigenciaFim: contract.dataFim,
          valorTotal: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0),
          saldoTotal: contract.items.reduce((sum, item) => sum + item.saldoValor, 0)
        }));
        setReportData(abertos);
        break;
        
      case 'liquidados':
        const liquidados = contracts.filter(c => c.status === 'liquidado').map(contract => ({
          nomeEscola: schoolInfo.nome,
          nomeUsuario: schoolInfo.usuario,
          numeroProcesso: contract.numeroContrato,
          fornecedor: contract.fornecedor.razaoSocial,
          objetoContrato: contract.items.map(item => item.produto).join(', '),
          vigenciaInicio: contract.dataInicio,
          vigenciaFim: contract.dataFim,
          valorTotal: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0),
          valorPago: contract.items.reduce((sum, item) => sum + item.valorPago, 0)
        }));
        setReportData(liquidados);
        break;
        
      case 'vencidos':
        const vencidos = contracts.filter(c => new Date(c.dataFim) < new Date()).map(contract => ({
          nomeEscola: schoolInfo.nome,
          nomeUsuario: schoolInfo.usuario,
          numeroProcesso: contract.numeroContrato,
          fornecedor: contract.fornecedor.razaoSocial,
          objetoContrato: contract.items.map(item => item.produto).join(', '),
          vigenciaInicio: contract.dataInicio,
          vigenciaFim: contract.dataFim,
          valorTotal: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0),
          saldoTotal: contract.items.reduce((sum, item) => sum + item.saldoValor, 0)
        }));
        setReportData(vencidos);
        break;
    }
  };

  const handleReportChange = (value: string) => {
    setSelectedReport(value);
    generateReport(value);
  };

  const exportReport = () => {
    // Simular exportação
    console.log('Exportando relatório:', selectedReport, reportData);
    alert(`Relatório "${getReportTitle()}" será exportado com ${reportData.length} registros.`);
  };

  const getReportTitle = () => {
    switch (selectedReport) {
      case 'completo': return 'Relatório Completo de Contratos';
      case 'abertos': return 'Contratos em Aberto';
      case 'liquidados': return 'Contratos Liquidados';
      case 'vencidos': return 'Contratos Vencidos';
      default: return 'Relatório';
    }
  };

  const validateRequiredFields = (item: any) => {
    if (selectedReport === 'completo') {
      const missing = [];
      if (!item.camposObrigatorios.temFornecedor) missing.push('Fornecedor');
      if (!item.camposObrigatorios.temNumeroProcesso) missing.push('Número do Processo');
      if (!item.camposObrigatorios.temVigencia) missing.push('Vigência');
      if (!item.camposObrigatorios.temValor) missing.push('Valor do Contrato');
      return missing;
    }
    return [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          3. Relatórios e Análises
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Select value={selectedReport} onValueChange={handleReportChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completo">Relatório Completo com Todas as Informações</SelectItem>
                <SelectItem value="abertos">Contratos em Aberto</SelectItem>
                <SelectItem value="liquidados">Contratos Liquidados</SelectItem>
                <SelectItem value="vencidos">Contratos Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedReport && (
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF/Excel
            </Button>
          )}
        </div>

        {reportData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{getReportTitle()}</h3>
              <span className="text-sm text-gray-500">
                {reportData.length} registro(s) encontrado(s)
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Escola</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Nº Processo</TableHead>
                    <TableHead>Objeto do Contrato</TableHead>
                    <TableHead>Vigência Início</TableHead>
                    <TableHead>Vigência Fim</TableHead>
                    <TableHead>Valor do Contrato</TableHead>
                    {selectedReport === 'abertos' && <TableHead>Saldo</TableHead>}
                    {selectedReport === 'liquidados' && <TableHead>Valor Pago</TableHead>}
                    {selectedReport === 'vencidos' && <TableHead>Saldo</TableHead>}
                    {selectedReport === 'completo' && <TableHead>Validação</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => {
                    const missingFields = validateRequiredFields(item);
                    const hasValidationIssues = missingFields.length > 0;
                    
                    return (
                      <TableRow key={index} className={hasValidationIssues ? "bg-red-50" : ""}>
                        <TableCell>{item.nomeEscola}</TableCell>
                        <TableCell>{item.nomeUsuario}</TableCell>
                        <TableCell className="font-medium">{item.fornecedor}</TableCell>
                        <TableCell className="font-medium">{item.numeroProcesso}</TableCell>
                        <TableCell>{item.objetoContrato}</TableCell>
                        <TableCell>{formatDate(item.vigenciaInicio)}</TableCell>
                        <TableCell>{formatDate(item.vigenciaFim)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.valorTotal || item.valorContrato)}
                        </TableCell>
                        {selectedReport === 'abertos' && (
                          <TableCell className="font-medium text-orange-600">
                            {formatCurrency(item.saldoTotal)}
                          </TableCell>
                        )}
                        {selectedReport === 'liquidados' && (
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(item.valorPago)}
                          </TableCell>
                        )}
                        {selectedReport === 'vencidos' && (
                          <TableCell className="font-medium text-orange-600">
                            {formatCurrency(item.saldoTotal)}
                          </TableCell>
                        )}
                        {selectedReport === 'completo' && (
                          <TableCell>
                            {hasValidationIssues ? (
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs">
                                  Faltam: {missingFields.join(', ')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-green-600 text-xs font-medium">✓ Completo</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {selectedReport === 'completo' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Informações sobre Validação:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Registros com fundo vermelho possuem campos obrigatórios ausentes</li>
                  <li>• Campos obrigatórios: Fornecedor, Número do Processo, Vigência, Valor do Contrato</li>
                  <li>• Complete os dados antes de exportar o relatório final</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
