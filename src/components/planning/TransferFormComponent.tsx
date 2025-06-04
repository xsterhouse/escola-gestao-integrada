
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransferFormComponentProps {
  schools: any[];
  centers: any[];
  approvedATAs: any[];
  onTransferSaved: (transfer: any) => void;
}

export function TransferFormComponent({ schools, centers, approvedATAs, onTransferSaved }: TransferFormComponentProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ataId: "",
    itemId: "",
    schoolOriginId: "",
    schoolDestinationId: "",
    centerId: "",
    quantity: "",
    justification: ""
  });

  const handleSaveTransfer = () => {
    if (!formData.ataId || !formData.schoolOriginId || !formData.quantity || !formData.justification) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const newTransfer = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      status: "pendente"
    };

    onTransferSaved(newTransfer);
    
    // Reset form
    setFormData({
      ataId: "",
      itemId: "",
      schoolOriginId: "",
      schoolDestinationId: "",
      centerId: "",
      quantity: "",
      justification: ""
    });

    toast({
      title: "Transferência registrada",
      description: "A transferência foi registrada com sucesso"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Nova Transferência de Saldo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ATA de Origem *</label>
            <Select value={formData.ataId} onValueChange={(value) => setFormData({...formData, ataId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a ATA" />
              </SelectTrigger>
              <SelectContent>
                {approvedATAs.map((ata) => (
                  <SelectItem key={ata.id} value={ata.id}>{ata.numeroATA}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Escola de Origem *</label>
            <Select value={formData.schoolOriginId} onValueChange={(value) => setFormData({...formData, schoolOriginId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a escola origem" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Escola de Destino</label>
            <Select value={formData.schoolDestinationId} onValueChange={(value) => setFormData({...formData, schoolDestinationId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a escola destino" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Central de Compras</label>
            <Select value={formData.centerId} onValueChange={(value) => setFormData({...formData, centerId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a central" />
              </SelectTrigger>
              <SelectContent>
                {centers.map((center) => (
                  <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantidade *</label>
          <Input
            type="number"
            placeholder="Digite a quantidade"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Justificativa *</label>
          <Textarea
            placeholder="Explique o motivo da transferência..."
            value={formData.justification}
            onChange={(e) => setFormData({...formData, justification: e.target.value})}
            className="h-24"
          />
        </div>

        <Button onClick={handleSaveTransfer} className="w-full" style={{ backgroundColor: "#012340" }}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Transferência
        </Button>
      </CardContent>
    </Card>
  );
}
