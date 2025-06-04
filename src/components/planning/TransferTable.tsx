
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransferTableProps {
  transfers: any[];
  onDeleteTransfer: (transferId: string, password: string, justification: string) => void;
  schools: any[];
  centers: any[];
}

export function TransferTable({ transfers, onDeleteTransfer, schools, centers }: TransferTableProps) {
  const { toast } = useToast();
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteJustification, setDeleteJustification] = useState("");
  const [transferToDelete, setTransferToDelete] = useState<string | null>(null);

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : "Escola não encontrada";
  };

  const getCenterName = (centerId: string) => {
    const center = centers.find(c => c.id === centerId);
    return center ? center.name : "Central não encontrada";
  };

  const handleViewTransfer = (transfer: any) => {
    setSelectedTransfer(transfer);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (transferId: string) => {
    setTransferToDelete(transferId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletePassword || !deleteJustification) {
      toast({
        title: "Erro",
        description: "Senha e justificativa são obrigatórias",
        variant: "destructive"
      });
      return;
    }

    if (transferToDelete) {
      onDeleteTransfer(transferToDelete, deletePassword, deleteJustification);
      setIsDeleteModalOpen(false);
      setDeletePassword("");
      setDeleteJustification("");
      setTransferToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      case "aprovada":
        return <Badge variant="default" className="bg-green-600">Aprovada</Badge>;
      case "rejeitada":
        return <Badge variant="destructive">Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transferências Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transferência registrada ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>ATA</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Escola Origem</TableHead>
                    <TableHead>Escola Destino</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        {new Date(transfer.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{transfer.ataId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transfer.itemName}</p>
                          {transfer.itemUnit && (
                            <Badge variant="outline" className="text-xs">
                              {transfer.itemUnit}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getSchoolName(transfer.schoolOriginId)}</TableCell>
                      <TableCell>
                        {transfer.schoolDestinationId ? getSchoolName(transfer.schoolDestinationId) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{transfer.quantity}</span>
                        {transfer.itemUnit && (
                          <span className="text-muted-foreground ml-1">{transfer.itemUnit}</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTransfer(transfer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(transfer.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Transferência</DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Data:</label>
                  <p>{new Date(selectedTransfer.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="font-medium">Status:</label>
                  <p>{getStatusBadge(selectedTransfer.status)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">ATA:</label>
                  <p>{selectedTransfer.ataId}</p>
                </div>
                <div>
                  <label className="font-medium">Item:</label>
                  <p>{selectedTransfer.itemName}</p>
                  {selectedTransfer.itemUnit && (
                    <Badge variant="outline" className="mt-1">
                      {selectedTransfer.itemUnit}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Escola Origem:</label>
                  <p>{getSchoolName(selectedTransfer.schoolOriginId)}</p>
                </div>
                <div>
                  <label className="font-medium">Escola Destino:</label>
                  <p>{selectedTransfer.schoolDestinationId ? getSchoolName(selectedTransfer.schoolDestinationId) : "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="font-medium">Quantidade:</label>
                <p>
                  {selectedTransfer.quantity}
                  {selectedTransfer.itemUnit && (
                    <span className="text-muted-foreground ml-1">{selectedTransfer.itemUnit}</span>
                  )}
                </p>
              </div>
              <div>
                <label className="font-medium">Central de Compras:</label>
                <p>{selectedTransfer.centerId ? getCenterName(selectedTransfer.centerId) : "N/A"}</p>
              </div>
              <div>
                <label className="font-medium">Justificativa:</label>
                <p>{selectedTransfer.justification}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Para excluir esta transferência, digite sua senha e justificativa:</p>
            <div>
              <label className="block text-sm font-medium mb-1">Senha *</label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Digite sua senha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Justificativa *</label>
              <Textarea
                value={deleteJustification}
                onChange={(e) => setDeleteJustification(e.target.value)}
                placeholder="Justifique a exclusão..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
