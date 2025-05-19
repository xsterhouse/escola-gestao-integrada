
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload, PlusCircle } from "lucide-react";
import { NewTransactionModal } from "./NewTransactionModal";
import { ImportStatementModal } from "./ImportStatementModal";
import { GenerateReportModal } from "./GenerateReportModal";

interface FinancialHeaderProps {
  bankAccounts: any[];
  onAddTransaction?: (transaction: any) => void;
  onImportTransactions?: (transactions: any[]) => void;
}

export function FinancialHeader({ 
  bankAccounts = [],
  onAddTransaction,
  onImportTransactions 
}: FinancialHeaderProps) {
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isImportStatementModalOpen, setIsImportStatementModalOpen] = useState(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie o controle financeiro da escola, conciliação bancária, contas a pagar e receber.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => setIsImportStatementModalOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Extrato
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Upload className="mr-2 h-4 w-4" />
            Importar Nota Fiscal
          </Button>
          <Button 
            size="sm" 
            className="h-9"
            onClick={() => setIsNewTransactionModalOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
          <Button 
            size="sm" 
            className="h-9"
            onClick={() => setIsGenerateReportModalOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* New Transaction Modal */}
      {onAddTransaction && (
        <NewTransactionModal
          isOpen={isNewTransactionModalOpen}
          onClose={() => setIsNewTransactionModalOpen(false)}
          bankAccounts={bankAccounts}
          onSave={onAddTransaction}
        />
      )}
      
      {/* Import Statement Modal */}
      {onImportTransactions && (
        <ImportStatementModal
          isOpen={isImportStatementModalOpen}
          onClose={() => setIsImportStatementModalOpen(false)}
          bankAccounts={bankAccounts}
          onImport={onImportTransactions}
        />
      )}
      
      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isGenerateReportModalOpen}
        onClose={() => setIsGenerateReportModalOpen(false)}
        bankAccounts={bankAccounts}
      />
    </div>
  );
}
