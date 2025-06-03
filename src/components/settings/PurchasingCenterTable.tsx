
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
import { Trash, Building2, User } from "lucide-react";

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
          <TableHead>CNPJ</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Endereço</TableHead>
          <TableHead>Cidade</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {centers.map(center => (
          <TableRow key={center.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                {center.name}
              </div>
            </TableCell>
            <TableCell className="font-mono text-sm">{center.cnpj || "—"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                {center.responsible || "—"}
              </div>
            </TableCell>
            <TableCell className="text-sm">{center.address || "—"}</TableCell>
            <TableCell className="text-sm">{center.city || "—"}</TableCell>
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
