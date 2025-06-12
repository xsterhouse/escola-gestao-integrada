
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContractData } from "@/lib/types";

interface ContractsTableProps {
  contracts: ContractData[];
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Tabela de Acompanhamento dos Contratos</CardTitle>
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
                  <TableHead>ATA ID</TableHead>
                  <TableHead>Número do Contrato</TableHead>
                  <TableHead>Dados do Fornecedor</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Itens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {contract.ataId || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {contract.numeroContrato}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{contract.fornecedor.razaoSocial}</div>
                        <div className="text-sm text-gray-500">{contract.fornecedor.cnpj}</div>
                        <div className="text-sm text-gray-500">{contract.fornecedor.endereco}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(contract.dataInicio)}</TableCell>
                    <TableCell>{formatDate(contract.dataFim)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={contract.status === 'ativo' ? 'default' : 'secondary'}
                        className={contract.status === 'ativo' ? 'bg-green-600' : ''}
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0))}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contract.items.map((item, index) => (
                          <div key={item.id} className="text-sm">
                            <div className="font-medium">{item.produto}</div>
                            <div className="text-gray-500">
                              Qtd: {item.quantidadeContratada} | 
                              Unit: {formatCurrency(item.precoUnitario)} |
                              Total: {formatCurrency(item.valorTotalContrato)}
                            </div>
                            {index < contract.items.length - 1 && <div className="border-b border-gray-100 my-2"></div>}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
