
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContractData, ContractFilter } from "@/lib/types";
import { Search, Filter } from "lucide-react";

interface ContractTrackingTableProps {
  contracts: ContractData[];
  filter: ContractFilter;
  onFilterChange: (filter: ContractFilter) => void;
}

export function ContractTrackingTable({ contracts, filter, onFilterChange }: ContractTrackingTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          2. Tabela de Acompanhamento dos Contratos
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por fornecedor..."
                value={filter.fornecedor || ''}
                onChange={(e) => onFilterChange({ ...filter, fornecedor: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Buscar por produto..."
              value={filter.produto || ''}
              onChange={(e) => onFilterChange({ ...filter, produto: e.target.value })}
            />
          </div>
          <div className="w-48">
            <Select 
              value={filter.status || 'todos'} 
              onValueChange={(value) => onFilterChange({ ...filter, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status do contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="encerrado">Encerrados</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
                <SelectItem value="liquidado">Liquidados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum contrato importado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd Contratada</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Valor Total Contrato</TableHead>
                  <TableHead>Notas Fiscais</TableHead>
                  <TableHead>Qtd Paga</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Saldo Qtd</TableHead>
                  <TableHead>Saldo Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  contract.items.map((item, itemIndex) => (
                    <TableRow key={`${contract.id}-${item.id}`}>
                      <TableCell className="font-medium">{item.produto}</TableCell>
                      <TableCell>{item.quantidadeContratada}</TableCell>
                      <TableCell>{formatCurrency(item.precoUnitario)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.valorTotalContrato)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {Object.entries(item.notasFiscais || {}).map(([nf, qtd]) => (
                            <div key={nf} className="text-sm">
                              <span className="font-medium">{nf}:</span> {qtd}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.quantidadePaga}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.valorPago)}</TableCell>
                      <TableCell className={item.saldoQuantidade > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                        {item.saldoQuantidade}
                      </TableCell>
                      <TableCell className={item.saldoValor > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                        {formatCurrency(item.saldoValor)}
                      </TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
