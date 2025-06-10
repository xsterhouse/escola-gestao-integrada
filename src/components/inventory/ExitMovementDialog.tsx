
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Search, AlertCircle, CheckCircle, ArrowRight, Building2 } from "lucide-react";
import { Invoice, InventoryMovement, School, PurchasingCenter } from "@/lib/types";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { validateExitQuantity, calculateProductStock } from "@/lib/inventory-calculations";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { ExitTypeSelector, EXIT_TYPES } from "./exit-movement/ExitTypeSelector";
import { DestinationSelector } from "./exit-movement/DestinationSelector";

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
  
  // Form states
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
  
  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);

  const currentStock = selectedProduct 
    ? calculateProductStock(selectedProduct.description, selectedProduct.unitOfMeasure, invoices, movements)
    : null;

  const canProceedToStep2 = selectedProduct && quantity && parseFloat(quantity) > 0;
  const canProceedToStep3 = canProceedToStep2 && exitType && destinationId;
  const canSubmit = canProceedToStep3 && reason.trim();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity("");
    setExitType("");
    setReason("");
    setDestinationId("");
    setDestinationType('school');
    setDocument("");
    setErrors([]);
    setCurrentStep(1);
    setIsValidating(false);
  };

  const handleProductSelect = (product: { description: string; unitOfMeasure: string; unitPrice: number }) => {
    setSelectedProduct({
      description: product.description,
      unitOfMeasure: product.unitOfMeasure
    });
    setErrors([]);
  };

  const validateCurrentStep = async () => {
    setIsValidating(true);
    const newErrors: string[] = [];
    
    if (currentStep === 1) {
      if (!selectedProduct) newErrors.push("Selecione um produto");
      if (!quantity || parseFloat(quantity) <= 0) newErrors.push("Quantidade deve ser maior que zero");
      
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
    }
    
    if (currentStep === 2) {
      if (!exitType) newErrors.push("Selecione o tipo de saída");
      if (!destinationId) newErrors.push("Selecione o destino");
    }
    
    if (currentStep === 3) {
      if (!reason.trim()) newErrors.push("Justificativa é obrigatória");
    }
    
    setErrors(newErrors);
    setIsValidating(false);
    
    return newErrors.length === 0;
  };

  const handleNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const unitPrice = currentStock?.averageUnitCost || 0;
    const totalCost = parseFloat(quantity) * unitPrice;

    const destinationOptions = destinationType === 'school' ? schools : purchasingCenters;
    const destination = destinationOptions.find(d => d.id === destinationId);
    const destinationName = destination?.name || '';

    const movementData = {
      type: 'saida' as const,
      date: new Date(),
      productDescription: selectedProduct!.description,
      quantity: parseFloat(quantity),
      unitOfMeasure: selectedProduct!.unitOfMeasure,
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

    try {
      onSubmit(movementData);
      onOpenChange(false);
    } catch (error) {
      setErrors(["Erro ao registrar a saída. Tente novamente."]);
    }
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (step === currentStep) return <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{step}</div>;
    return <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">{step}</div>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Package className="h-6 w-6" />
            Registrar Saída de Item
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between py-6 px-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStepIcon(1)}
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
              Produto & Quantidade
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2">
            {getStepIcon(2)}
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
              Tipo & Destino
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2">
            {getStepIcon(3)}
            <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
              Confirmação
            </span>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Corrija os seguintes erros:</h4>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Origin School Display */}
        {currentSchool && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Escola de Origem</p>
                  <p className="text-sm text-blue-700">{currentSchool.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Product Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Produto *</Label>
                  <ProductAutocomplete
                    invoices={invoices}
                    onProductSelect={handleProductSelect}
                    placeholder="Digite para buscar produtos..."
                  />
                  {selectedProduct && (
                    <Badge variant="outline" className="mt-2">
                      {selectedProduct.description} - {selectedProduct.unitOfMeasure}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Quantidade *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    className="text-lg"
                  />
                  {selectedProduct && currentStock && (
                    <p className="text-sm text-gray-600">
                      Disponível: <span className="font-medium">{currentStock.currentStock} {selectedProduct.unitOfMeasure}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              {currentStock && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-green-900 mb-3">Informações do Estoque</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-green-800">Estoque Atual</p>
                        <p className="text-lg font-bold text-green-700">
                          {currentStock.currentStock} {currentStock.unitOfMeasure}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Custo Médio</p>
                        <p className="text-lg font-bold text-green-700">
                          R$ {currentStock.averageUnitCost.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Valor Total</p>
                        <p className="text-lg font-bold text-green-700">
                          R$ {currentStock.totalValue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Type and Destination */}
          {currentStep === 2 && (
            <div className="space-y-6 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExitTypeSelector value={exitType} onChange={setExitType} />
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">Documento de Referência</Label>
                  <Input
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
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6 p-1">
              <div className="space-y-2">
                <Label className="text-base font-medium">Justificativa *</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo da saída..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Summary Card */}
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-gray-900 mb-4">Resumo da Saída</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Produto:</p>
                      <p className="font-medium">{selectedProduct?.description}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantidade:</p>
                      <p className="font-medium">{quantity} {selectedProduct?.unitOfMeasure}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tipo de Saída:</p>
                      <p className="font-medium">{EXIT_TYPES.find(t => t.value === exitType)?.label}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Destino:</p>
                      <p className="font-medium">
                        {(destinationType === 'school' ? schools : purchasingCenters)
                          .find(d => d.id === destinationId)?.name}
                      </p>
                    </div>
                    {currentStock && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Valor Estimado:</p>
                        <p className="font-medium text-lg">
                          R$ {(parseFloat(quantity || "0") * currentStock.averageUnitCost).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevStep}>
                Voltar
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                onClick={handleNextStep} 
                disabled={
                  (currentStep === 1 && !canProceedToStep2) ||
                  (currentStep === 2 && !canProceedToStep3) ||
                  isValidating
                }
              >
                {isValidating ? "Validando..." : "Próximo"}
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmit || isValidating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isValidating ? "Processando..." : "Registrar Saída"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
