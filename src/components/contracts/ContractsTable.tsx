
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceData } from "@/lib/types";

interface ContractsTableProps {
  invoices: InvoiceData[];
}

export function ContractsTable({ invoices }: ContractsTableProps) {
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
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma nota fiscal importada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dados do Fornecedor</TableHead>
                  <TableHead>Data Emissão NF</TableHead>
                  <TableHead>Número da DANFE</TableHead>
                  <TableHead>Valor Total DANFE</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Unitário</TableHead>
                  <TableHead>Valor Total Itens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  invoice.items.map((item, itemIndex) => (
                    <TableRow key={`${invoice.id}-${item.id}`}>
                      {itemIndex === 0 && (
                        <>
                          <TableCell rowSpan={invoice.items.length} className="border-r">
                            <div className="space-y-1">
                              <div className="font-medium">{invoice.supplier.razaoSocial}</div>
                              <div className="text-sm text-gray-500">{invoice.supplier.cnpj}</div>
                              <div className="text-sm text-gray-500">{invoice.supplier.endereco}</div>
                            </div>
                          </TableCell>
                          <TableCell rowSpan={invoice.items.length} className="border-r">
                            {formatDate(invoice.dataEmissao)}
                          </TableCell>
                          <TableCell rowSpan={invoice.items.length} className="border-r">
                            {invoice.numeroDanfe}
                          </TableCell>
                          <TableCell rowSpan={invoice.items.length} className="border-r font-medium">
                            {formatCurrency(invoice.valorTotal)}
                          </TableCell>
                        </>
                      )}
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.valorTotal)}</TableCell>
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
