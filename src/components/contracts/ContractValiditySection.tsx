
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { ContractData } from "@/lib/types";
import { EditValidityDialog } from "./EditValidityDialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContractValiditySectionProps {
  contracts: ContractData[];
  onUpdateContract: (contract: ContractData) => void;
}

interface GroupedContract {
  fornecedor: string;
  numeroContrato: string;
  contracts: ContractData[];
  totalItems: number;
}

export function ContractValiditySection({ contracts, onUpdateContract }: ContractValiditySectionProps) {
  const [editingContract, setEditingContract] = useState<ContractData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1; // Um fornecedor/processo por página

  // Agrupar contratos por fornecedor e número do contrato
  const groupedContracts = useMemo(() => {
    const grouped = contracts.reduce((acc, contract) => {
      const key = `${contract.fornecedor.razaoSocial}-${contract.numeroContrato}`;
      
      if (!acc[key]) {
        acc[key] = {
          fornecedor: contract.fornecedor.razaoSocial,
          numeroContrato: contract.numeroContrato,
          contracts: [],
          totalItems: 0
        };
      }
      
      acc[key].contracts.push(contract);
      acc[key].totalItems += contract.items.length;
      
      return acc;
    }, {} as Record<string, GroupedContract>);

    return Object.values(grouped);
  }, [contracts]);

  const totalPages = Math.ceil(groupedContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGroup = groupedContracts[startIndex];

  const calculateValidityProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    
    return progress;
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 30) {
      return "bg-green-500";
    } else if (progress <= 70) {
      return "bg-blue-500";
    } else {
      return "bg-red-500";
    }
  };

  const getStatusText = (progress: number) => {
    if (progress >= 100) {
      return "Vencido";
    } else if (progress >= 80) {
      return "Próximo ao vencimento";
    } else if (progress >= 50) {
      return "Em andamento";
    } else {
      return "Início da vigência";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEditValidity = (contract: ContractData) => {
    setEditingContract(contract);
  };

  const handleUpdateValidity = (updatedContract: ContractData) => {
    onUpdateContract(updatedContract);
    setEditingContract(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Controle Visual da Vigência dos Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhum contrato importado ainda.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentGroup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Controle Visual da Vigência dos Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhum grupo encontrado para a página atual.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pegar o primeiro contrato do grupo para informações gerais
  const representativeContract = currentGroup.contracts[0];
  const progress = calculateValidityProgress(representativeContract.dataInicio, representativeContract.dataFim);
  const progressColor = getProgressColor(progress);
  const statusText = getStatusText(progress);

  // Consolidar todos os itens do grupo
  const allItems = currentGroup.contracts.flatMap(contract => 
    contract.items.map(item => ({ ...item, contractId: contract.id }))
  );

  const totalValorContrato = allItems.reduce((sum, item) => sum + item.valorTotalContrato, 0);
  const totalSaldoValor = allItems.reduce((sum, item) => sum + item.saldoValor, 0);
  const totalValorPago = allItems.reduce((sum, item) => sum + item.valorPago, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Controle Visual da Vigência dos Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Cabeçalho do Fornecedor/Processo */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    Contrato {currentGroup.numeroContrato}
                  </h3>
                  <p className="text-gray-600">{currentGroup.fornecedor}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Valor Total: {formatCurrency(totalValorContrato)}</span>
                    <span>Valor Pago: {formatCurrency(totalValorPago)}</span>
                    <span>Saldo: {formatCurrency(totalSaldoValor)}</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2">
                    {progress >= 80 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    <span className={`text-sm font-medium ${
                      progress >= 100 ? 'text-red-600' : 
                      progress >= 80 ? 'text-orange-600' : 
                      progress >= 50 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {statusText}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditValidity(representativeContract)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Vigência
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Início: {formatDate(representativeContract.dataInicio)}</span>
                  <span>Fim: {formatDate(representativeContract.dataFim)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da vigência</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={progress} className="h-4" />
                    <div 
                      className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Itens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Itens do Contrato ({allItems.length} itens)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd Contratada</TableHead>
                      <TableHead className="text-right">Preço Unitário</TableHead>
                      <TableHead className="text-right">Valor Contrato</TableHead>
                      <TableHead className="text-right">Qtd Paga</TableHead>
                      <TableHead className="text-right">Valor Pago</TableHead>
                      <TableHead className="text-right">Saldo Qtd</TableHead>
                      <TableHead className="text-right">Saldo Valor</TableHead>
                      <TableHead className="text-right">% Executado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allItems.map((item, index) => {
                      const percentualExecutado = item.valorTotalContrato > 0 
                        ? (item.valorPago / item.valorTotalContrato) * 100 
                        : 0;

                      return (
                        <TableRow key={`${item.contractId}-${item.id}-${index}`}>
                          <TableCell className="font-medium">{item.produto}</TableCell>
                          <TableCell className="text-right">{item.quantidadeContratada}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.precoUnitario)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.valorTotalContrato)}</TableCell>
                          <TableCell className="text-right">{item.quantidadePaga}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.valorPago)}</TableCell>
                          <TableCell className="text-right">{item.saldoQuantidade}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.saldoValor)}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium ${
                              percentualExecutado >= 100 ? 'text-green-600' :
                              percentualExecutado >= 75 ? 'text-blue-600' :
                              percentualExecutado >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {percentualExecutado.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Informações da Paginação */}
            {totalPages > 1 && (
              <div className="text-center text-sm text-gray-500">
                Página {currentPage} de {totalPages} - 
                Mostrando fornecedor/processo {startIndex + 1} de {groupedContracts.length}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editingContract && (
        <EditValidityDialog
          contract={editingContract}
          onUpdate={handleUpdateValidity}
          onClose={() => setEditingContract(null)}
        />
      )}
    </>
  );
}
