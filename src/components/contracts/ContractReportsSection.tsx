
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, FileText, Download } from "lucide-react";
import { ContractData } from "@/lib/types";

interface ContractReportsSectionProps {
  contracts: ContractData[];
}

export function ContractReportsSection({ contracts }: ContractReportsSectionProps) {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportData, setReportData] = useState<any[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generateReport = (reportType: string) => {
    switch (reportType) {
      case 'abertos':
        const abertos = contracts.filter(c => c.status === 'ativo').map(contract => ({
          numeroContrato: contract.numeroContrato,
          fornecedor: contract.fornecedor.razaoSocial,
          dataFim: contract.dataFim,
          valorTotal: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0),
          saldoTotal: contract.items.reduce((sum, item) => sum + item.saldoValor, 0)
        }));
        setReportData(abertos);
        break;
        
      case 'liquidados':
        const liquidados = contracts.filter(c => c.status === 'liquidado').map(contract => ({
          numeroContrato: contract.numeroContrato,
          fornecedor: contract.fornecedor.razaoSocial,
          dataFim: contract.dataFim,
          valorTotal: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0),
          valorPago: contract.items.reduce((sum, item) => sum + item.valorPago, 0)
        }));
        setReportData(liquidados);
        break;
        
      case 'vencidos':
        const vencidos = contracts.filter(c => new Date(c.dataFim) < new Date()).map(contract => ({
          numeroContrato: contract.numeroContrato,
          fornecedor: contract.fornecedor.razaoSocial,
          dataFim: contract.dataFim,
          valorTotal: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0),
          saldoTotal: contract.items.reduce((sum, item) => sum + item.saldoValor, 0)
        }));
        setReportData(vencidos);
        break;
        
      case 'comparativo':
        const comparativo = contracts.map(contract => ({
          numeroContrato: contract.numeroContrato,
          fornecedor: contract.fornecedor.razaoSocial,
          valorContratado: contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0),
          valorPago: contract.items.reduce((sum, item) => sum + item.valorPago, 0),
          saldo: contract.items.reduce((sum, item) => sum + item.saldoValor, 0),
          percentualPago: (contract.items.reduce((sum, item) => sum + item.valorPago, 0) / 
                          contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0)) * 100
        }));
        setReportData(comparativo);
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
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          4. Relatórios e Análises
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
                <SelectItem value="abertos">Contratos em Aberto</SelectItem>
                <SelectItem value="liquidados">Contratos Liquidados</SelectItem>
                <SelectItem value="vencidos">Contratos Vencidos</SelectItem>
                <SelectItem value="comparativo">Comparativo Contratado vs Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedReport && (
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>

        {reportData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedReport === 'abertos' && 'Contratos em Aberto'}
                {selectedReport === 'liquidados' && 'Contratos Liquidados'}
                {selectedReport === 'vencidos' && 'Contratos Vencidos'}
                {selectedReport === 'comparativo' && 'Comparativo Contratado vs Pago'}
              </h3>
              <span className="text-sm text-gray-500">
                {reportData.length} registro(s) encontrado(s)
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Contrato</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    {selectedReport !== 'liquidados' && <TableHead>Data Fim</TableHead>}
                    <TableHead>Valor {selectedReport === 'comparativo' ? 'Contratado' : 'Total'}</TableHead>
                    {selectedReport === 'liquidados' && <TableHead>Valor Pago</TableHead>}
                    {(selectedReport === 'abertos' || selectedReport === 'vencidos') && <TableHead>Saldo</TableHead>}
                    {selectedReport === 'comparativo' && (
                      <>
                        <TableHead>Valor Pago</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>% Pago</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.numeroContrato}</TableCell>
                      <TableCell>{item.fornecedor}</TableCell>
                      {selectedReport !== 'liquidados' && (
                        <TableCell>{formatDate(item.dataFim)}</TableCell>
                      )}
                      <TableCell className="font-medium">
                        {formatCurrency(item.valorTotal || item.valorContratado)}
                      </TableCell>
                      {selectedReport === 'liquidados' && (
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(item.valorPago)}
                        </TableCell>
                      )}
                      {(selectedReport === 'abertos' || selectedReport === 'vencidos') && (
                        <TableCell className="font-medium text-orange-600">
                          {formatCurrency(item.saldoTotal)}
                        </TableCell>
                      )}
                      {selectedReport === 'comparativo' && (
                        <>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(item.valorPago)}
                          </TableCell>
                          <TableCell className="font-medium text-orange-600">
                            {formatCurrency(item.saldo)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.percentualPago.toFixed(1)}%
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
