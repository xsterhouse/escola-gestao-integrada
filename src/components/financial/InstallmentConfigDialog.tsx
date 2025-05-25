
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { format, addMonths } from "date-fns";

interface InstallmentConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onConfirm: (installmentData: any) => void;
}

export function InstallmentConfigDialog({
  isOpen,
  onClose,
  formData,
  onConfirm,
}: InstallmentConfigDialogProps) {
  const [adjustments, setAdjustments] = useState<{[key: number]: number}>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const baseValue = parseFloat(formData.value || "0");
  const installmentValue = baseValue / formData.installments;

  const generateInstallments = () => {
    const installments = [];
    for (let i = 0; i < formData.installments; i++) {
      const dueDate = addMonths(new Date(formData.dueDate), i);
      const value = adjustments[i] || installmentValue;
      
      installments.push({
        index: i + 1,
        dueDate,
        value,
        description: `${formData.description} (${i + 1}/${formData.installments})`
      });
    }
    return installments;
  };

  const installments = generateInstallments();
  const totalAdjusted = installments.reduce((sum, inst) => sum + inst.value, 0);
  const difference = totalAdjusted - baseValue;

  const handleValueChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAdjustments(prev => ({
      ...prev,
      [index]: numValue
    }));
  };

  const handleConfirm = () => {
    if (Math.abs(difference) > 0.01) {
      return; // Don't allow confirmation if values don't match
    }
    onConfirm({ installments, adjustments });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Configurar Parcelas</DialogTitle>
          <DialogDescription>
            Configure as datas de vencimento e valores de cada parcela.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Valor Total:</strong> {formatCurrency(baseValue)}
            </div>
            <div>
              <strong>Número de Parcelas:</strong> {formData.installments}
            </div>
            <div>
              <strong>Valor por Parcela:</strong> {formatCurrency(installmentValue)}
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {installments.map((installment, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 items-center p-2 border rounded">
                    <div>
                      <Label className="text-xs">Parcela</Label>
                      <div className="font-medium">{installment.index}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Vencimento</Label>
                      <div className="text-sm">{format(installment.dueDate, 'dd/MM/yyyy')}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={adjustments[index] || installmentValue}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <div className="text-sm truncate">{installment.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <strong>Total das Parcelas:</strong> {formatCurrency(totalAdjusted)}
            </div>
            {Math.abs(difference) > 0.01 && (
              <div className="text-red-600">
                <strong>Diferença:</strong> {formatCurrency(difference)}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={Math.abs(difference) > 0.01}
          >
            Criar Parcelas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
