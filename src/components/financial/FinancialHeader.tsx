
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, PlusCircle, TrendingUp } from "lucide-react";
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
    <div className="space-y-6">
      {/* Modern Header with Gradient Background */}
      <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold">Financeiro</h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Controle completo das finanças da escola com ferramentas avançadas de gestão, 
                conciliação bancária e relatórios detalhados.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                onClick={() => setIsImportStatementModalOpen(true)}
              >
                <Upload className="mr-2 h-5 w-5" />
                Importar Extrato
              </Button>
              
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg transition-all duration-300"
                onClick={() => setIsNewTransactionModalOpen(true)}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Novo Lançamento
              </Button>
              
              <Button 
                size="lg" 
                className="bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-300"
                onClick={() => setIsGenerateReportModalOpen(true)}
              >
                <FileText className="mr-2 h-5 w-5" />
                Relatórios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
