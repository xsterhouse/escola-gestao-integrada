
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { ATAContract } from "@/lib/types";
import { TransferButton } from "./TransferButton";

interface ATAContractsListProps {
  contracts: ATAContract[];
  onUpdateContract: (contract: ATAContract) => void;
}

export function ATAContractsList({ contracts, onUpdateContract }: ATAContractsListProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Agrupar por fornecedor + número do processo
  const groupedContracts = useMemo(() => {
    const groups = new Map<string, ATAContract[]>();
    
    contracts.forEach(contract => {
      const key = `${contract.fornecedor}_${contract.numeroProcesso}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(contract);
    });

    return Array.from(groups.entries()).map(([key, contracts]) => ({
      key,
      fornecedor: contracts[0].fornecedor,
      numeroProcesso: contracts[0].numeroProcesso,
      contracts,
    }));
  }, [contracts]);

  const totalPages = groupedContracts.length;
  const currentGroup = groupedContracts[currentPage];

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Nenhuma ATA registrada ainda. Use o formulário acima para registrar a primeira ATA.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          ATAs Registradas {totalPages > 0 && `(${currentPage + 1}/${totalPages})`}
        </CardTitle>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Página {currentPage + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      {currentGroup && (
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{currentGroup.fornecedor}</h3>
              <p className="text-muted-foreground">Processo: {currentGroup.numeroProcesso}</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Qtd. Contratada</TableHead>
                    <TableHead>Saldo Disponível</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentGroup.contracts.map((contract) =>
                    contract.items.map((item) => (
                      <TableRow key={`${contract.id}_${item.id}`}>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>{item.unidade}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>
                          <span className={item.saldoDisponivel < item.quantidade * 0.2 ? "text-red-600 font-medium" : ""}>
                            {item.saldoDisponivel}
                          </span>
                        </TableCell>
                        <TableCell>R$ {item.valorUnitario.toFixed(2)}</TableCell>
                        <TableCell>R$ {item.valorTotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{new Date(contract.dataInicioVigencia).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">
                              até {new Date(contract.dataFimVigencia).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TransferButton
                            contractId={contract.id}
                            itemId={item.id}
                            availableQuantity={item.saldoDisponivel}
                            itemName={item.nome}
                            onTransferComplete={() => {
                              // Recarregar dados após transferência
                              window.location.reload();
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
