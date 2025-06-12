
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Save, X } from "lucide-react";

interface EditValidityDialogProps {
  contract: ContractData;
  onUpdate: (contract: ContractData) => void;
  onClose: () => void;
}

export function EditValidityDialog({ contract, onUpdate, onClose }: EditValidityDialogProps) {
  const { toast } = useToast();
  const [dataInicio, setDataInicio] = useState(
    contract.dataInicio.toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    contract.dataFim.toISOString().split('T')[0]
  );

  const handleSave = () => {
    const novaDataInicio = new Date(dataInicio);
    const novaDataFim = new Date(dataFim);

    if (novaDataFim <= novaDataInicio) {
      toast({
        title: "Erro",
        description: "A data de fim deve ser posterior à data de início",
        variant: "destructive",
      });
      return;
    }

    const updatedContract: ContractData = {
      ...contract,
      dataInicio: novaDataInicio,
      dataFim: novaDataFim,
      updatedAt: new Date(),
    };

    onUpdate(updatedContract);
    
    toast({
      title: "Sucesso",
      description: "Vigência do contrato atualizada com sucesso!",
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Editar Vigência do Contrato
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">
              Contrato {contract.numeroContrato}
            </h3>
            <p className="text-sm text-gray-600">
              {contract.fornecedor.razaoSocial}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Vigência Atual:</span>
              <div>{formatDate(contract.dataInicio)} até {formatDate(contract.dataFim)}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
