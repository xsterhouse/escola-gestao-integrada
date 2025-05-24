
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ContractData, ContractFilter } from "@/lib/types";
import { Search, Filter, Edit, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { EditValidityDialog } from "./EditValidityDialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ContractTrackingTableProps {
  contracts: ContractData[];
  filter: ContractFilter;
  onFilterChange: (filter: ContractFilter) => void;
  onUpdateContract: (contract: ContractData) => void;
}

interface GroupedContract {
  numeroContrato: string;
  fornecedor: string;
  contracts: ContractData[];
  totalItems: number;
}

export function ContractTrackingTable({ 
  contracts, 
  filter, 
  onFilterChange,
  onUpdateContract 
}: ContractTrackingTableProps) {
  const [editingContract, setEditingContract] = useState<ContractData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1; // Um contrato/processo por página

  // Agrupar contratos por número do contrato e fornecedor
  const groupedContracts = React.useMemo(() => {
    const grouped = contracts.reduce((acc, contract) => {
      const key = `${contract.numeroContrato}-${contract.fornecedor.razaoSocial}`;
      
      if (!acc[key]) {
        acc[key] = {
          numeroContrato: contract.numeroContrato,
          fornecedor: contract.fornecedor.razaoSocial,
          contracts: [],
          totalItems: 0
        };
      }
      
      acc[key].contracts.push(contract);
      acc[key].totalItems += contract.items.length;
      
      return acc;
    }, {} as Record<string, GroupedContract>);

    return Object.values(grouped).filter(group => {
      const matchesFornecedor = !filter.fornecedor || 
        group.fornecedor.toLowerCase().includes(filter.fornecedor.toLowerCase());
      const matchesContrato = !filter.produto || 
        group.numeroContrato.toLowerCase().includes(filter.produto.toLowerCase());
      
      return matchesFornecedor && matchesContrato;
    });
  }, [contracts, filter]);

  const totalPages = Math.ceil(groupedContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGroup = groupedContracts[startIndex];

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

  // Consolidar todos os itens do grupo atual
  const allItems = currentGroup ? currentGroup.contracts.flatMap(contract => 
    contract.items.map(item => ({ ...item, contractId: contract.id }))
  ) : [];

  return (
    <>
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
                placeholder="Buscar por número do processo..."
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
          {groupedContracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {contracts.length === 0 ? 
                "Nenhum contrato importado ainda." : 
                "Nenhum contrato encontrado com os filtros aplicados."
              }
            </div>
          ) : currentGroup ? (
            <div className="space-y-6">
              {/* Cabeçalho do Contrato/Processo */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">Processo: {currentGroup.numeroContrato}</h3>
                    <p className="text-gray-600">Fornecedor: {currentGroup.fornecedor}</p>
                    <p className="text-sm text-gray-500">Total de itens: {currentGroup.totalItems}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditValidity(currentGroup.contracts[0])}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Vigência
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd Contratada</TableHead>
                      <TableHead className="text-right">Preço Unitário</TableHead>
                      <TableHead className="text-right">Valor Total Contrato</TableHead>
                      <TableHead>Notas Fiscais</TableHead>
                      <TableHead className="text-right">Qtd Paga</TableHead>
                      <TableHead className="text-right">Valor Pago</TableHead>
                      <TableHead className="text-right">Saldo Qtd</TableHead>
                      <TableHead className="text-right">Saldo Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allItems.map((item, index) => (
                      <TableRow key={`${item.contractId}-${item.id}-${index}`}>
                        <TableCell className="font-medium">{item.produto}</TableCell>
                        <TableCell className="text-right">{item.quantidadeContratada}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.precoUnitario)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.valorTotalContrato)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {Object.entries(item.notasFiscais || {}).map(([nf, qtd]) => (
                              <div key={nf} className="text-sm">
                                <span className="font-medium">{nf}:</span> {qtd}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{item.quantidadePaga}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.valorPago)}</TableCell>
                        <TableCell className={`text-right ${item.saldoQuantidade > 0 ? "text-orange-600 font-medium" : "text-green-600"}`}>
                          {item.saldoQuantidade}
                        </TableCell>
                        <TableCell className={`text-right ${item.saldoValor > 0 ? "text-orange-600 font-medium" : "text-green-600"}`}>
                          {formatCurrency(item.saldoValor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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
                  Mostrando processo {startIndex + 1} de {groupedContracts.length}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum contrato encontrado para a página atual.
            </div>
          )}
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
