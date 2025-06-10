
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package } from "lucide-react";
import { Invoice, InventoryMovement, School, PurchasingCenter } from "@/lib/types";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { validateExitQuantity, calculateProductStock } from "@/lib/inventory-calculations";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { ExitMovementValidation } from "./exit-movement/ExitMovementValidation";
import { OriginSchoolDisplay } from "./exit-movement/OriginSchoolDisplay";
import { StockInfoDisplay } from "./exit-movement/StockInfoDisplay";
import { DestinationSelector } from "./exit-movement/DestinationSelector";
import { ExitTypeSelector, EXIT_TYPES } from "./exit-movement/ExitTypeSelector";

interface ExitMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => void;
  invoices: Invoice[];
  movements: InventoryMovement[];
}

export function ExitMovementDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  invoices,
  movements 
}: ExitMovementDialogProps) {
  const { user, currentSchool } = useAuth();
  const { data: schools } = useLocalStorageSync<School>('schools', []);
  const { data: purchasingCenters } = useLocalStorageSync<PurchasingCenter>('purchasing-centers', []);
  
  const [selectedProduct, setSelectedProduct] = useState<{
    description: string;
    unitOfMeasure: string;
  } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [exitType, setExitType] = useState("");
  const [reason, setReason] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [destinationType, setDestinationType] = useState<'school' | 'purchasing_center'>('school');
  const [document, setDocument] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const currentStock = selectedProduct 
    ? calculateProductStock(selectedProduct.description, selectedProduct.unitOfMeasure, invoices, movements)
    : null;

  const handleProductSelect = (product: { description: string; unitOfMeasure: string; unitPrice: number }) => {
    console.log("🔍 Produto selecionado:", product);
    setSelectedProduct({
      description: product.description,
      unitOfMeasure: product.unitOfMeasure
    });
    // Limpar erros quando um produto for selecionado
    setErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Iniciando validação do formulário...");
    
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

    if (!destinationId) {
      newErrors.push("Selecione o destino");
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

    console.log("🔍 Erros encontrados:", newErrors);

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("✅ Formulário válido, criando movimento...");

    const unitPrice = currentStock?.averageUnitCost || 0;
    const totalCost = parseFloat(quantity) * unitPrice;

    // Find destination name
    const destinationOptions = destinationType === 'school' ? schools : purchasingCenters;
    const destination = destinationOptions.find(d => d.id === destinationId);
    const destinationName = destination?.name || '';

    const movementData = {
      type: 'saida' as const,
      date: new Date(),
      productDescription: selectedProduct!.description,
      quantity: parseFloat(quantity),
      unitOfMeasure: selectedProduct!.unitOfMeasure,
      unitPrice,
      totalCost,
      source: 'manual' as const,
      reason: `${EXIT_TYPES.find(t => t.value === exitType)?.label}: ${reason}`,
      createdBy: user?.name || 'Sistema',
      exitType,
      destinationType,
      destinationId,
      destinationName,
      originSchoolId: currentSchool?.id,
      originSchoolName: currentSchool?.name,
      documentReference: document || undefined,
      status: 'saida' as const
    };

    console.log("📤 Enviando movimento:", movementData);

    try {
      onSubmit(movementData);
      
      // Reset form
      setSelectedProduct(null);
      setQuantity("");
      setExitType("");
      setReason("");
      setDestinationId("");
      setDestinationType('school');
      setDocument("");
      setErrors([]);
      
      console.log("✅ Movimento enviado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao enviar movimento:", error);
      setErrors(["Erro ao registrar a saída. Tente novamente."]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Registrar Saída de Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ExitMovementValidation errors={errors} />

          <OriginSchoolDisplay currentSchool={currentSchool} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produto *</Label>
              <ProductAutocomplete
                invoices={invoices}
                onProductSelect={handleProductSelect}
                value={selectedProduct?.description || ""}
                placeholder="Selecione um produto..."
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

          <StockInfoDisplay currentStock={currentStock} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExitTypeSelector value={exitType} onChange={setExitType} />

            <div className="space-y-2">
              <Label htmlFor="document">Documento de Referência</Label>
              <Input
                id="document"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Número de requisição, termo de doação, etc."
              />
            </div>
          </div>

          <DestinationSelector
            destinationType={destinationType}
            destinationId={destinationId}
            schools={schools}
            purchasingCenters={purchasingCenters}
            onDestinationTypeChange={setDestinationType}
            onDestinationIdChange={setDestinationId}
          />

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

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
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
