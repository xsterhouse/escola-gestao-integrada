
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import { Invoice, InventoryMovement } from "@/lib/types";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { validateExitQuantity, calculateProductStock } from "@/lib/inventory-calculations";
import { useAuth } from "@/contexts/AuthContext";

interface ExitMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => void;
  invoices: Invoice[];
  movements: InventoryMovement[];
}

const EXIT_TYPES = [
  { value: 'consumo', label: 'Consumo' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'perda', label: 'Perda' },
  { value: 'vencimento', label: 'Vencimento' },
  { value: 'doacao', label: 'Doação' },
  { value: 'outros', label: 'Outros' }
];

export function ExitMovementDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  invoices,
  movements 
}: ExitMovementDialogProps) {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<{
    description: string;
    unitOfMeasure: string;
  } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [exitType, setExitType] = useState("");
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("");
  const [document, setDocument] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const currentStock = selectedProduct 
    ? calculateProductStock(selectedProduct.description, selectedProduct.unitOfMeasure, invoices, movements)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: string[] = [];
    
    if (!selectedProduct) {
      newErrors.push("Selecione um produto");
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.push("Quantidade deve ser maior que zero");
    }
    
    if (!exitType) {
      newErrors.push("Selecione o tipo de saída");
    }
    
    if (!reason.trim()) {
      newErrors.push("Justificativa é obrigatória");
    }

    if (selectedProduct && quantity) {
      const validation = validateExitQuantity(
        selectedProduct.description,
        selectedProduct.unitOfMeasure,
        parseFloat(quantity),
        invoices,
        movements
      );
      
      if (!validation.isValid) {
        newErrors.push(validation.message || "Quantidade inválida");
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const unitPrice = currentStock?.averageUnitCost || 0;
    const totalCost = parseFloat(quantity) * unitPrice;

    onSubmit({
      type: 'saida',
      date: new Date(),
      productDescription: selectedProduct!.description,
      quantity: parseFloat(quantity),
      unitOfMeasure: selectedProduct!.unitOfMeasure,
      unitPrice,
      totalCost,
      source: 'manual',
      reason: `${EXIT_TYPES.find(t => t.value === exitType)?.label}: ${reason}`,
      createdBy: user?.name || 'Sistema',
      exitType,
      destination: destination || undefined,
      documentReference: document || undefined
    });

    // Reset form
    setSelectedProduct(null);
    setQuantity("");
    setExitType("");
    setReason("");
    setDestination("");
    setDocument("");
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Registrar Saída de Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Corrija os seguintes erros:</p>
                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produto *</Label>
              <ProductAutocomplete
                invoices={invoices}
                onProductSelect={setSelectedProduct}
                value={selectedProduct?.description || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
              />
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  Unidade: {selectedProduct.unitOfMeasure}
                  {currentStock && ` | Disponível: ${currentStock.currentStock}`}
                </p>
              )}
            </div>
          </div>

          {currentStock && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-900">Estoque Atual</p>
                    <p className="text-blue-700">{currentStock.currentStock} {currentStock.unitOfMeasure}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Custo Médio</p>
                    <p className="text-blue-700">R$ {currentStock.averageUnitCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Valor Total</p>
                    <p className="text-blue-700">R$ {currentStock.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exitType">Tipo de Saída *</Label>
              <Select value={exitType} onValueChange={setExitType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de saída" />
                </SelectTrigger>
                <SelectContent>
                  {EXIT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destino/Beneficiário</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Para onde está sendo destinado"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">Documento de Referência</Label>
            <Input
              id="document"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="Número de requisição, termo de doação, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Justificativa *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da saída..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Saída
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
