
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { InventoryMovement, Invoice } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { SimpleProductAutocomplete } from "@/components/planning/SimpleProductAutocomplete";
import { ProductSuggestion } from "@/components/planning/types";

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
  const [productDescription, setProductDescription] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSuggestion | null>(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  console.log("🔄 SimpleExitMovementDialog renderizado - open:", open);

  const resetForm = () => {
    console.log("🧹 Resetando formulário do modal");
    setProductDescription("");
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
    setUnitOfMeasure("");
    setUnitPrice("");
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Calcular entradas do produto das notas fiscais aprovadas
  const getProductEntries = (description: string) => {
    return invoices
      .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
      .flatMap(invoice => invoice.items)
      .filter(item => item.description === description)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Calcular saídas já registradas do produto
  const getProductExits = (description: string) => {
    return movements
      .filter(movement => movement.productDescription === description && movement.type === 'saida')
      .reduce((sum, movement) => sum + movement.quantity, 0);
  };

  // Calcular estoque disponível
  const getAvailableStock = (description: string) => {
    const entries = getProductEntries(description);
    const exits = getProductExits(description);
    return entries - exits;
  };

  const handleProductSelect = (product: ProductSuggestion) => {
    console.log("🎯 Produto selecionado no modal:", product);
    
    setSelectedProduct(product);
    setProductDescription(product.description);
    setUnitOfMeasure(product.unit);
    
    // Buscar preço do produto nas notas fiscais
    const productInInvoice = invoices
      .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
      .flatMap(invoice => invoice.items)
      .find(item => item.description === product.description);
    
    if (productInInvoice) {
      setUnitPrice(productInInvoice.unitPrice.toString());
    }
    
    console.log("📋 Dados preenchidos automaticamente:", {
      description: product.description,
      unit: product.unit,
      price: productInInvoice?.unitPrice
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📤 Tentando submeter saída:", {
      productDescription,
      quantity,
      reason,
      unitOfMeasure,
      unitPrice
    });

    if (!productDescription || !quantity || !reason || !unitOfMeasure || !unitPrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    const quantityNum = parseFloat(quantity);
    const unitPriceNum = parseFloat(unitPrice);

    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Por favor, insira uma quantidade válida.",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido.",
        variant: "destructive"
      });
      return;
    }

    // Verificar estoque disponível
    const availableStock = getAvailableStock(productDescription);
    console.log("📊 Verificando estoque disponível:", availableStock, "para quantidade:", quantityNum);

    if (quantityNum > availableStock) {
      toast({
        title: "Estoque insuficiente",
        description: `Estoque disponível: ${availableStock} ${unitOfMeasure}`,
        variant: "destructive"
      });
      return;
    }

    const movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt"> = {
      type: 'saida',
      date: new Date().toISOString(),
      productDescription,
      quantity: quantityNum,
      unitOfMeasure,
      unitPrice: unitPriceNum,
      totalCost: quantityNum * unitPriceNum,
      source: 'manual',
      status: 'saida',
      reason
    };

    console.log("✅ Submetendo movimento de saída:", movement);
    onSubmit(movement);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Saída de Item</DialogTitle>
          <DialogDescription>
            Registre a saída de um item do estoque informando o produto, quantidade e motivo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Produto</Label>
            <SimpleProductAutocomplete
              value={productDescription}
              onChange={setProductDescription}
              onProductSelect={handleProductSelect}
              placeholder="Digite para buscar produtos..."
            />
            {selectedProduct && (
              <p className="text-sm text-muted-foreground mt-1">
                Estoque disponível: {getAvailableStock(productDescription)} {unitOfMeasure}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                placeholder="Ex: UN, KG, L"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="unitPrice">Valor Unitário</Label>
            <Input
              id="unitPrice"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0,00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="reason">Motivo da Saída</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da saída do estoque..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Saída
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
