
import { PurchasingCenter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react";

type PurchasingCenterTableProps = {
  centers: PurchasingCenter[];
  onEdit: (center: PurchasingCenter) => void;
  onDelete: (id: string) => void;
};

export function PurchasingCenterTable({
  centers,
  onEdit,
  onDelete,
}: PurchasingCenterTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {centers.map(center => (
          <TableRow key={center.id}>
            <TableCell className="font-medium">{center.name}</TableCell>
            <TableCell>{center.description}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(center)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(center.id)}>
                <Trash className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
