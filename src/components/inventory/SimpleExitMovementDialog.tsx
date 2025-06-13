
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertCircle, CheckCircle } from "lucide-react";
import { Invoice, InventoryMovement } from "@/lib/types";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { validateExitQuantity, calculateProductStock } from "@/lib/inventory-calculations";

interface SimpleExitMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => void;
  invoices: Invoice[];
  movements: InventoryMovement[];
}

export function SimpleExitMovementDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  invoices,
  movements 
}: SimpleExitMovementDialogProps) {
  // Estados do formulário
  const [selectedProduct, setSelectedProduct] = useState<{
    description: string;
    unitOfMeasure: string;
    unitPrice: number;
  } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Calcular estoque atual do produto selecionado
  const currentStock = selectedProduct 
    ? calculateProductStock(selectedProduct.description, selectedProduct.unitOfMeasure, invoices, movements)
    : null;

  // Reset form quando modal abrir/fechar
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
    setIsSubmitting(false);
    setError("");
    
    // Reset do ProductAutocomplete
    if ((window as any).resetProductAutocomplete) {
      (window as any).resetProductAutocomplete();
    }
  };

  const handleProductSelect = (product: { description: string; unitOfMeasure: string; unitPrice: number }) => {
    console.log("📦 Produto selecionado:", product);
    setSelectedProduct(product);
    setError("");
  };

  const handleProductClear = () => {
    setSelectedProduct(null);
    setQuantity("");
    setError("");
  };

  const validateForm = () => {
    if (!selectedProduct) {
      setError("Selecione um produto");
      return false;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError("Informe uma quantidade válida");
      return false;
    }

    if (!reason.trim()) {
      setError("Informe o motivo da saída");
      return false;
    }

    // Validar se há estoque suficiente
    const validation = validateExitQuantity(
      selectedProduct.description,
      selectedProduct.unitOfMeasure,
      parseFloat(quantity),
      invoices,
      movements
    );

    if (!validation.isValid) {
      setError(validation.message || "Estoque insuficiente");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const movementData = {
        type: 'saida' as const,
        date: new Date(),
        productDescription: selectedProduct!.description,
        quantity: parseFloat(quantity),
        unitOfMeasure: selectedProduct!.unitOfMeasure,
        unitPrice: selectedProduct!.unitPrice,
        totalCost: parseFloat(quantity) * selectedProduct!.unitPrice,
        source: 'manual' as const,
        reason: reason.trim(),
      };

      console.log("📤 Registrando saída:", movementData);
      onSubmit(movementData);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
      setError("Erro ao registrar a saída. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedProduct && quantity && parseFloat(quantity) > 0 && reason.trim() && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Registrar Saída de Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Exibir erro */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seleção do produto */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Produto *</Label>
            <ProductAutocomplete
              invoices={invoices}
              onProductSelect={handleProductSelect}
              onClear={handleProductClear}
              placeholder="Digite para buscar produtos..."
            />
          </div>

          {/* Informações do estoque atual */}
          {currentStock && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Produto</p>
                    <p className="text-blue-900">{selectedProduct?.description}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Estoque Atual</p>
                    <p className="text-blue-900 font-bold">
                      {currentStock.currentStock} {selectedProduct?.unitOfMeasure}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Valor Unitário</p>
                    <p className="text-blue-900 font-bold">
                      R$ {currentStock.averageUnitCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quantidade */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quantidade *</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError("");
              }}
              placeholder="0.00"
              disabled={!selectedProduct}
            />
            {selectedProduct && (
              <p className="text-xs text-gray-500">
                Unidade: {selectedProduct.unitOfMeasure}
              </p>
            )}
          </div>

          {/* Motivo da saída */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Motivo da Saída *</Label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Ex: Consumo interno, transferência, doação..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Resumo do valor */}
          {selectedProduct && quantity && parseFloat(quantity) > 0 && currentStock && (
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor Total da Saída:</span>
                  <span className="font-bold text-lg">
                    R$ {(parseFloat(quantity) * currentStock.averageUnitCost).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Registrar Saída
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
