
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, FileText } from "lucide-react";
import { Planning, PlanningItem } from "@/lib/types";
import { generatePlanningPDF } from "@/lib/pdf-utils";
import { TransferButton } from "./TransferButton";

interface PlanningTableProps {
  items: PlanningItem[];
  onRemoveItem: (id: string) => void;
  onTransferItem: (itemId: string, toSchoolId: string, quantity: number, justificativa: string) => void;
  isFinalized: boolean;
  currentPlan: Planning | null;
}

export function PlanningTable({ items, onRemoveItem, onTransferItem, isFinalized, currentPlan }: PlanningTableProps) {
  const generateReport = () => {
    if (currentPlan) {
      generatePlanningPDF(currentPlan);
    }
  };

  const handleTransferComplete = () => {
    // Refresh the planning data after transfer
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Itens do Planejamento</CardTitle>
        {isFinalized && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8" 
            onClick={generateReport}
          >
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Item</TableHead>
                  <TableHead className="w-24">Qtde.</TableHead>
                  <TableHead className="w-24">Unidade</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {isFinalized && typeof item.availableQuantity === 'number'
                        ? item.availableQuantity
                        : item.quantity}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isFinalized ? (
                        <TransferButton 
                          contractId={currentPlan?.id || ""}
                          itemId={item.id}
                          availableQuantity={item.availableQuantity ?? item.quantity}
                          itemName={item.name}
                          onTransferComplete={handleTransferComplete}
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 border rounded-md bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Nenhum item adicionado ao planejamento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
