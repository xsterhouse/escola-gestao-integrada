
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download } from "lucide-react";
import { ATAContract } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ReportGenerationModal } from "./ReportGenerationModal";

export function ATAReportsTab() {
  const { currentSchool } = useAuth();
  const [contracts, setContracts] = useState<ATAContract[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (currentSchool) {
      const storedContracts = JSON.parse(
        localStorage.getItem(`ata_contracts_${currentSchool.id}`) || "[]"
      );
      setContracts(storedContracts);
    }
  }, [currentSchool]);

  const totalContratos = contracts.length;
  const totalItens = contracts.reduce((total, contract) => total + contract.items.length, 0);
  const valorTotalGeral = contracts.reduce((total, contract) => 
    total + contract.items.reduce((itemTotal, item) => itemTotal + item.valorTotal, 0), 0
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios de ATAs
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsReportModalOpen(true)}
              disabled={contracts.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsReportModalOpen(true)}
              disabled={contracts.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Total de ATAs</h3>
              <p className="text-2xl font-bold text-blue-700">{totalContratos}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Total de Itens</h3>
              <p className="text-2xl font-bold text-green-700">{totalItens}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Valor Total</h3>
              <p className="text-2xl font-bold text-purple-700">
                R$ {valorTotalGeral.toFixed(2)}
              </p>
            </div>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma ATA registrada para gerar relatórios.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número do Processo</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data da ATA</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Qtd. Itens</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.numeroProcesso}
                      </TableCell>
                      <TableCell>{contract.fornecedor}</TableCell>
                      <TableCell>
                        {new Date(contract.dataATA).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{new Date(contract.dataInicioVigencia).toLocaleDateString('pt-BR')}</div>
                          <div className="text-muted-foreground">
                            até {new Date(contract.dataFimVigencia).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{contract.items.length}</TableCell>
                      <TableCell>
                        R$ {contract.items.reduce((total, item) => total + item.valorTotal, 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{contract.createdBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReportGenerationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        contracts={contracts}
      />
    </div>
  );
}
