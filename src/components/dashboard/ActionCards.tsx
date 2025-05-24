
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentAccount, ReceivableAccount } from "@/lib/types";

interface ActionCardsProps {
  onAddPayment?: (payment: PaymentAccount) => void;
  onAddReceivable?: (receivable: ReceivableAccount) => void;
}

export function ActionCards({ onAddPayment, onAddReceivable }: ActionCardsProps) {
  const navigate = useNavigate();

  const handleNavigateToReports = () => {
    // Navigate to reports section or show reports modal
    console.log("Navigate to reports");
  };

  const handleNavigateToAnalytics = () => {
    // Navigate to analytics section
    console.log("Navigate to analytics");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-blue-900">Relatórios Financeiros</CardTitle>
          <CardDescription className="text-blue-600">Visualize relatórios detalhados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:translate-x-1 transition-transform text-blue-700 hover:text-blue-800"
              onClick={handleNavigateToReports}
            >
              <span className="mr-2">Acessar</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-green-900">Análise de Fluxo</CardTitle>
          <CardDescription className="text-green-600">Acompanhe o fluxo de caixa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:translate-x-1 transition-transform text-green-700 hover:text-green-800"
              onClick={handleNavigateToAnalytics}
            >
              <span className="mr-2">Visualizar</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
