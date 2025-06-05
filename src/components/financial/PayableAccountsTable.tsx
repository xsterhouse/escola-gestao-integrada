
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentAccount, Invoice } from "@/lib/types";
import { format } from "date-fns";
import { CheckCircle, Edit2, Trash2 } from "lucide-react";

interface PayableAccountsTableProps {
  accounts: PaymentAccount[];
  invoices: Invoice[];
  onPaymentConfirm: (account: PaymentAccount) => void;
  onEditPayment: (account: PaymentAccount) => void;
  onDeletePayment: (account: PaymentAccount) => void;
  formatCurrency: (value: number) => string;
}

export function PayableAccountsTable({
  accounts,
  invoices,
  onPaymentConfirm,
  onEditPayment,
  onDeletePayment,
  formatCurrency,
}: PayableAccountsTableProps) {
  // Separar contas criadas de XML das contas manuais
  const xmlAccounts = accounts.filter(account => account.invoiceId);
  const manualAccounts = accounts.filter(account => !account.invoiceId);

  // Função para buscar dados da invoice
  const getInvoiceData = (invoiceId: string) => {
    return invoices.find(inv => inv.id === invoiceId);
  };

  return (
    <div className="space-y-6">
      {/* Tabela para Contas de XMLs */}
      {xmlAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contas a Pagar - Notas Fiscais Importadas</CardTitle>
            <CardDescription>
              Contas criadas a partir de XMLs de notas fiscais importadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {xmlAccounts.map(account => {
                  const invoiceData = getInvoiceData(account.invoiceId!);
                  
                  if (!invoiceData) {
                    return (
                      <TableRow key={account.id}>
                        <TableCell colSpan={10} className="text-center text-muted-foreground">
                          Dados da nota fiscal não encontrados
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return invoiceData.items.map((item, index) => (
                    <TableRow key={`${account.id}-${index}`}>
                      {index === 0 && (
                        <>
                          <TableCell rowSpan={invoiceData.items.length} className="border-r">
                            <div className="space-y-1 text-sm">
                              <div className="font-medium">{invoiceData.supplier.name}</div>
                              <div className="text-muted-foreground">CNPJ: {invoiceData.supplier.cnpj}</div>
                              <div className="text-muted-foreground">{invoiceData.supplier.endereco}</div>
                              <div className="text-muted-foreground">{invoiceData.supplier.telefone}</div>
                            </div>
                          </TableCell>
                          <TableCell rowSpan={invoiceData.items.length} className="border-r">
                            {format(new Date(invoiceData.issueDate), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell rowSpan={invoiceData.items.length} className="border-r">
                            {invoiceData.danfeNumber}
                          </TableCell>
                          <TableCell rowSpan={invoiceData.items.length} className="border-r">
                            {formatCurrency(invoiceData.totalValue)}
                          </TableCell>
                        </>
                      )}
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity} {item.unitOfMeasure}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                      {index === 0 && (
                        <>
                          <TableCell rowSpan={invoiceData.items.length} className="border-l">
                            <div className="flex items-center">
                              <div className={`mr-2 h-2 w-2 rounded-full ${
                                account.status === 'pago' ? 'bg-green-500' : 'bg-amber-500'
                              }`} />
                              {account.status === 'pago' ? 'Pago' : 'A Pagar'}
                              {account.isDuplicate && (
                                <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                                  Duplicado
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell rowSpan={invoiceData.items.length} className="border-l">
                            <div className="flex items-center gap-2">
                              {account.status === 'a_pagar' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => onPaymentConfirm(account)}
                                    title="Registrar Pagamento"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => onEditPayment(account)}
                                    title="Editar"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onDeletePayment(account)}
                                title={account.status === 'pago' ? 'Remover Pagamento' : 'Excluir'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabela para Contas Manuais */}
      {manualAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contas a Pagar - Lançamentos Manuais</CardTitle>
            <CardDescription>
              Contas criadas manualmente pelos usuários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Tipo de Despesa</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manualAccounts.map(account => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {account.description}
                        {account.isDuplicate && (
                          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                            Duplicado
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{account.supplier}</TableCell>
                    <TableCell>{account.expenseType}</TableCell>
                    <TableCell>{format(new Date(account.dueDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{formatCurrency(account.value)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`mr-2 h-2 w-2 rounded-full ${
                          account.status === 'pago' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        {account.status === 'pago' ? 'Pago' : 'A Pagar'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {account.status === 'a_pagar' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onPaymentConfirm(account)}
                              title="Registrar Pagamento"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onEditPayment(account)}
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeletePayment(account)}
                          title={account.status === 'pago' ? 'Remover Pagamento' : 'Excluir'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há contas */}
      {accounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma conta a pagar encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
