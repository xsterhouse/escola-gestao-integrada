
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

  const getSelectedATA = () => {
    return approvedATAs.find(ata => ata.id === formData.ataId);
  };

  const getSelectedItem = () => {
    const ata = getSelectedATA();
    if (!ata || !formData.itemId) return null;
    return ata.items.find((item: any) => item.id === formData.itemId);
  };

  const handleSaveTransfer = () => {
    if (!formData.ataId || !formData.itemId || !formData.schoolOriginId || !formData.quantity || !formData.justification) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedItem = getSelectedItem();
    if (!selectedItem) {
      toast({
        title: "Erro",
        description: "Item selecionado não encontrado",
        variant: "destructive"
      });
      return;
    }

    const newTransfer = {
      id: Date.now().toString(),
      ...formData,
      itemName: selectedItem.descricaoProduto,
      itemUnit: selectedItem.unidade,
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
            <Select value={formData.ataId} onValueChange={(value) => setFormData({...formData, ataId: value, itemId: ""})}>
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
            <label className="block text-sm font-medium mb-1">Item a Transferir *</label>
            <Select 
              value={formData.itemId} 
              onValueChange={(value) => setFormData({...formData, itemId: value})}
              disabled={!formData.ataId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.ataId ? "Selecione o item" : "Selecione uma ATA primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {getSelectedATA()?.items.map((item: any) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.numeroItem} - {item.descricaoProduto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {getSelectedItem() && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Item Selecionado:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Produto:</span>
                <p className="text-blue-700">{getSelectedItem()?.descricaoProduto}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Unidade:</span>
                <p className="text-blue-700">
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    {getSelectedItem()?.unidade}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Quantidade Disponível:</span>
                <p className="text-blue-700 font-medium">{getSelectedItem()?.quantidade}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Escola de Destino</label>
            <Select value={formData.schoolDestinationId} onValueChange={(value) => setFormData({...formData, schoolDestinationId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a escola destino (opcional)" />
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
            <label className="block text-sm font-medium mb-1">Central de Compras</label>
            <Select value={formData.centerId} onValueChange={(value) => setFormData({...formData, centerId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a central (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {centers.map((center) => (
                  <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Quantidade a Transferir *
              {getSelectedItem() && (
                <span className="text-blue-600 font-normal"> ({getSelectedItem()?.unidade})</span>
              )}
            </label>
            <Input
              type="number"
              placeholder={getSelectedItem() ? `Digite a quantidade em ${getSelectedItem()?.unidade}` : "Digite a quantidade"}
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              max={getSelectedItem()?.quantidade}
            />
            {getSelectedItem() && formData.quantity && parseFloat(formData.quantity) > getSelectedItem()?.quantidade && (
              <p className="text-red-600 text-xs mt-1">
                Quantidade não pode ser maior que {getSelectedItem()?.quantidade} {getSelectedItem()?.unidade}
              </p>
            )}
          </div>
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
