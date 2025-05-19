
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewPaymentModal } from "./NewPaymentModal";
import { PaymentAccount, ReceivableAccount } from "@/lib/types";

interface ActionCardsProps {
  onAddPayment?: (payment: PaymentAccount) => void;
  onAddReceivable?: (receivable: ReceivableAccount) => void;
}

export function ActionCards({ onAddPayment, onAddReceivable }: ActionCardsProps) {
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigateToProducts = () => {
    navigate("/products");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-t-4 border-t-[#012340] hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Registrar Produto</CardTitle>
          <CardDescription>Cadastre produtos para inventário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="bg-[#012340]/10 p-2 rounded-lg">
              <Package className="h-5 w-5 text-[#012340]" />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:translate-x-1 transition-transform"
              onClick={handleNavigateToProducts}
            >
              <span className="mr-2">Acessar</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-[#012340] hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Novo Pagamento</CardTitle>
          <CardDescription>Registre uma nova conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="bg-[#012340]/10 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-[#012340]" />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:translate-x-1 transition-transform"
              onClick={() => setIsNewPaymentModalOpen(true)}
            >
              <span className="mr-2">Registrar</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Payment Modal */}
      {onAddPayment && onAddReceivable && (
        <NewPaymentModal
          isOpen={isNewPaymentModalOpen}
          onClose={() => setIsNewPaymentModalOpen(false)}
          onSavePayment={onAddPayment}
          onSaveReceivable={onAddReceivable}
        />
      )}
    </div>
  );
}
