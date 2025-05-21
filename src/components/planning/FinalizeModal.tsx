
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import type { FoodItem } from "@/pages/Planning";
import { generatePlanningPDF } from "@/lib/pdf-utils";

interface FinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ataNumber: string;
  items: FoodItem[];
}

export function FinalizeModal({ isOpen, onClose, ataNumber, items }: FinalizeModalProps) {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const schoolName = "EMEF João Paulo II";
  const userName = "Maria Oliveira";
  
  const handleGenerateReport = () => {
    generatePlanningPDF({
      ataNumber,
      date: currentDate,
      schoolName,
      userName,
      items
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Planejamento Finalizado!</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-center mb-4 text-primary">
              {ataNumber}
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Escola:</span>
                <span>{schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Responsável:</span>
                <span>{userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Data:</span>
                <span>{currentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Itens:</span>
                <span>{items.length}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Seu planejamento foi finalizado com sucesso. Você pode gerar um relatório em PDF
            com todos os detalhes.
          </p>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleGenerateReport} className="w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" /> 
            Gerar Relatório PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
