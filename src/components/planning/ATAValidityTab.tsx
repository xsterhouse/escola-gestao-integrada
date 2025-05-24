
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, AlertTriangle } from "lucide-react";
import { ATAContract } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export function ATAValidityTab() {
  const { currentSchool } = useAuth();
  const [contracts, setContracts] = useState<ATAContract[]>([]);

  useEffect(() => {
    if (currentSchool) {
      const storedContracts = JSON.parse(
        localStorage.getItem(`ata_contracts_${currentSchool.id}`) || "[]"
      );
      setContracts(storedContracts);
    }
  }, [currentSchool]);

  // Agrupar por fornecedor e processo, ordenar por data de término
  const groupedValidityData = useMemo(() => {
    const groups = new Map<string, ATAContract>();
    
    contracts.forEach(contract => {
      const key = `${contract.fornecedor}_${contract.numeroProcesso}`;
      if (!groups.has(key)) {
        groups.set(key, contract);
      }
    });

    return Array.from(groups.values())
      .sort((a, b) => new Date(a.dataFimVigencia).getTime() - new Date(b.dataFimVigencia).getTime());
  }, [contracts]);

  const getStatusValidation = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "Vencida", color: "text-red-600", icon: true };
    } else if (diffDays <= 30) {
      return { status: "Próxima ao vencimento", color: "text-orange-600", icon: true };
    } else if (diffDays <= 90) {
      return { status: "Atenção", color: "text-yellow-600", icon: false };
    } else {
      return { status: "Vigente", color: "text-green-600", icon: false };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Controle de Vigência das ATAs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {groupedValidityData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma ATA registrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número do Processo</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Data de Início da Vigência</TableHead>
                  <TableHead>Data de Término da Vigência</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedValidityData.map((contract) => {
                  const validation = getStatusValidation(new Date(contract.dataFimVigencia));
                  
                  return (
                    <TableRow key={`${contract.fornecedor}_${contract.numeroProcesso}`}>
                      <TableCell className="font-medium">
                        {contract.numeroProcesso}
                      </TableCell>
                      <TableCell>{contract.fornecedor}</TableCell>
                      <TableCell>
                        {new Date(contract.dataInicioVigencia).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Date(contract.dataFimVigencia).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {validation.icon && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={`font-medium ${validation.color}`}>
                            {validation.status}
                          </span>
                        </div>
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
