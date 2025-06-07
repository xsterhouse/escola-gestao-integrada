
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PendingTransfer, getPendingTransfersForSchool, approveTransfer, rejectTransfer } from "@/services/transferService";

export function PendingTransfersTab() {
  const { currentSchool, user } = useAuth();
  const { toast } = useToast();
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<PendingTransfer | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentSchool) {
      loadPendingTransfers();
    }
  }, [currentSchool]);

  const loadPendingTransfers = () => {
    if (!currentSchool) return;
    
    const transfers = getPendingTransfersForSchool(currentSchool.id);
    setPendingTransfers(transfers);
  };

  const handleApprove = async (transferId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = approveTransfer(transferId, user.name);
      
      if (result.success) {
        toast({
          title: "Transferência aprovada",
          description: "A transferência foi aprovada e processada com sucesso."
        });
        loadPendingTransfers();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível aprovar a transferência.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao processar a aprovação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user || !selectedTransfer || !rejectionReason.trim()) {
      toast({
        title: "Erro",
        description: "Motivo da rejeição é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = rejectTransfer(selectedTransfer.id, user.name, rejectionReason);
      
      if (result.success) {
        toast({
          title: "Transferência rejeitada",
          description: "A transferência foi rejeitada."
        });
        setIsRejectModalOpen(false);
        setSelectedTransfer(null);
        setRejectionReason("");
        loadPendingTransfers();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível rejeitar a transferência.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao processar a rejeição.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (transfer: PendingTransfer) => {
    setSelectedTransfer(transfer);
    setIsRejectModalOpen(true);
  };

  const getSchoolName = (schoolId: string) => {
    try {
      const schools = JSON.parse(localStorage.getItem("schools") || "[]");
      const school = schools.find((s: any) => s.id === schoolId);
      return school?.name || "Escola não encontrada";
    } catch {
      return "Escola não encontrada";
    }
  };

  if (!currentSchool) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Selecione uma escola para ver as transferências pendentes.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transferências Pendentes de Aprovação
            {pendingTransfers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingTransfers.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTransfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transferência pendente de aprovação.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Escola Origem</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Justificativa</TableHead>
                    <TableHead>Data Solicitação</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{getSchoolName(transfer.fromSchoolId)}</TableCell>
                      <TableCell className="font-medium">{transfer.itemName}</TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell className="max-w-xs truncate" title={transfer.justificativa}>
                        {transfer.justificativa}
                      </TableCell>
                      <TableCell>
                        {transfer.createdAt.toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{transfer.createdBy}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(transfer.id)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectModal(transfer)}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
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

      {/* Modal de Rejeição */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Transferência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Você está rejeitando a transferência de <strong>{selectedTransfer?.itemName}</strong> 
                (Qtd: {selectedTransfer?.quantity}) da escola <strong>{selectedTransfer ? getSchoolName(selectedTransfer.fromSchoolId) : ""}</strong>.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Motivo da rejeição *
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedTransfer(null);
                  setRejectionReason("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
              >
                Confirmar Rejeição
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
