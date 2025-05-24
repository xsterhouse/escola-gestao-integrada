
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Contract } from "@/lib/types";
import { Search, Calendar, FileText } from "lucide-react";

interface ContractsReportsSectionProps {
  contracts: Contract[];
}

export function ContractsReportsSection({ contracts }: ContractsReportsSectionProps) {
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const calculateVigencyProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
    
    return progress;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 33) return "bg-green-500";
    if (progress < 66) return "bg-blue-500";
    return "bg-red-500";
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = filterStatus === "todos" || contract.status === filterStatus;
    const matchesSearch = contract.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.itensContratados.some(item => 
                           item.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesStatus && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>6. Relatórios Gerenciais e Controle de Vigência</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por fornecedor ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status do contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Em Aberto</SelectItem>
              <SelectItem value="vencido">Encerrados</SelectItem>
              <SelectItem value="liquidado">Liquidados</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>

        {/* Tabela de Contratos */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {contracts.length === 0 
              ? "Nenhum contrato importado ainda."
              : "Nenhum contrato encontrado com os filtros aplicados."
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Itens Contratados</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Contratado</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => {
                  const progress = calculateVigencyProgress(contract.dataInicio, contract.dataFim);
                  const progressColor = getProgressColor(progress);
                  
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.fornecedor}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {contract.itensContratados.map((item, index) => (
                            <div key={index} className="text-sm">{item}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{contract.quantidade}</TableCell>
                      <TableCell>{formatCurrency(contract.valorContratado)}</TableCell>
                      <TableCell>{formatDate(contract.dataInicio)}</TableCell>
                      <TableCell>{formatDate(contract.dataFim)}</TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[120px]">
                          <div className="flex justify-between text-sm">
                            <span>Vigência</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress 
                            value={progress} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contract.status === 'ativo' ? 'bg-green-100 text-green-800' :
                          contract.status === 'vencido' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contract.status === 'ativo' ? 'Em Aberto' :
                           contract.status === 'vencido' ? 'Encerrado' : 'Liquidado'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
