
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface ReceivableInstallmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onConfirm: (installmentData: any) => void;
}

export function ReceivableInstallmentDialog({
  isOpen,
  onClose,
  formData,
  onConfirm,
}: ReceivableInstallmentDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateInstallments = () => {
    const totalValue = parseFloat(formData.value);
    const installmentValue = totalValue / formData.installments;
    const installments = [];

    for (let i = 0; i < formData.installments; i++) {
      const expectedDate = new Date(formData.expectedDate);
      expectedDate.setMonth(expectedDate.getMonth() + i);
      
      installments.push({
        number: i + 1,
        expectedDate,
        value: installmentValue,
        description: `${formData.description} (${i + 1}/${formData.installments})`
      });
    }
    
    return installments;
  };

  const installments = calculateInstallments();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Configuração de Parcelas</DialogTitle>
          <DialogDescription>
            Revise as parcelas que serão criadas automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Total:</strong> {formatCurrency(parseFloat(formData.value))}
            </div>
            <div>
              <strong>Parcelas:</strong> {formData.installments}x
            </div>
            <div>
              <strong>Valor por parcela:</strong> {formatCurrency(parseFloat(formData.value) / formData.installments)}
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data Prevista</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((installment) => (
                  <TableRow key={installment.number}>
                    <TableCell>{installment.number}</TableCell>
                    <TableCell>{installment.description}</TableCell>
                    <TableCell>{format(installment.expectedDate, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{formatCurrency(installment.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(installments)}>Criar Parcelas</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
