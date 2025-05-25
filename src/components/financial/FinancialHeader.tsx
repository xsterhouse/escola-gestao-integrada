
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, TrendingUp } from "lucide-react";
import { NewTransactionModal } from "./NewTransactionModal";
import { GenerateReportModal } from "./GenerateReportModal";

interface FinancialHeaderProps {
  bankAccounts: any[];
  onAddTransaction?: (transaction: any) => void;
  showActionButtons?: boolean;
}

export function FinancialHeader({ 
  bankAccounts = [],
  onAddTransaction,
  showActionButtons = false
}: FinancialHeaderProps) {
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Modern Header with Custom Background Color */}
      <Card className="bg-[#012340] border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-semibold">Financeiro</h1>
              </div>
              <p className="text-blue-100 text-sm max-w-2xl">
                Controle completo das finanças da escola com ferramentas avançadas de gestão.
              </p>
            </div>
            
            {showActionButtons && (
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="default" 
                  className="bg-white text-[#012340] hover:bg-blue-50 shadow-lg transition-all duration-300"
                  onClick={() => setIsNewTransactionModalOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Lançamento
                </Button>
                
                <Button 
                  size="default" 
                  className="bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-300"
                  onClick={() => setIsGenerateReportModalOpen(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Relatórios
                </Button>
              </div>
            )}
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
      
      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isGenerateReportModalOpen}
        onClose={() => setIsGenerateReportModalOpen(false)}
        bankAccounts={bankAccounts}
      />
    </div>
  );
}
