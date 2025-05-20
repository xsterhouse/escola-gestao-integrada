
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { PlanItem } from "@/lib/types";

interface PlanningListProps {
  items?: PlanItem[];
  readOnly?: boolean;
  onRemove?: (id: string) => void;
}

const PlanningList: React.FC<PlanningListProps> = ({ 
  items = [], 
  readOnly = false,
  onRemove 
}) => {
  // If no items were passed as props, try to get them from localStorage
  const [localItems, setLocalItems] = React.useState<PlanItem[]>([]);
  
  React.useEffect(() => {
    if (items.length > 0) {
      setLocalItems(items);
    } else {
      // For demonstration purposes, we'll use mock data
      const mockItems: PlanItem[] = [
        {
          id: "1",
          name: "Arroz Branco",
          quantity: 100,
          unit: "kg",
          description: "Arroz branco tipo 1, pacote de 5kg"
        },
        {
          id: "2",
          name: "Feijão Carioca",
          quantity: 50,
          unit: "kg",
          description: "Feijão carioca tipo 1, pacote de 1kg"
        },
        {
          id: "3",
          name: "Leite Integral",
          quantity: 200,
          unit: "litros",
          description: "Leite integral UHT, embalagem tetra pak de 1L"
        }
      ];
      setLocalItems(mockItems);
    }
  }, [items]);

  const handleRemove = (id: string) => {
    if (onRemove) {
      onRemove(id);
    } else {
      setLocalItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens do Planejamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {localItems.length === 0
              ? "Nenhum item adicionado ao planejamento."
              : `Total de ${localItems.length} itens no planejamento.`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Item</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="w-[300px]">Descrição</TableHead>
              {!readOnly && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {localItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {item.description || "-"}
                </TableCell>
                {!readOnly && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PlanningList;
