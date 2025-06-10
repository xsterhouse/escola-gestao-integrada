
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AccountFormFields } from "./AccountFormFields";
import { useAccountValidation, formatAccountCode } from "./AccountValidation";

interface Account {
  id: string;
  code: string;
  description: string;
  type: 'ativo' | 'passivo' | 'patrimonio' | 'receita' | 'despesa';
  level: number;
  parent?: string;
  isActive: boolean;
  createdAt: Date;
}

interface AccountFormProps {
  accounts: Account[];
  onAccountSave: (account: Account) => void;
  editingAccount: Account | null;
  setEditingAccount: React.Dispatch<React.SetStateAction<Account | null>>;
}

export function AccountForm({ 
  accounts, 
  onAccountSave, 
  editingAccount, 
  setEditingAccount 
}: AccountFormProps) {
  const [formData, setFormData] = useState({
    code: editingAccount?.code || "",
    description: editingAccount?.description || "",
    type: editingAccount?.type || "",
    parent: editingAccount?.parent || "none"
  });

  const { toast } = useToast();
  const { isCodeValid, codeExists } = useAccountValidation(
    formData.code, 
    accounts, 
    editingAccount?.id
  );

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const maskedValue = formatAccountCode(inputValue);
    setFormData(prev => ({ ...prev, code: maskedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.description || !formData.type) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!isCodeValid) {
      toast({
        title: "Código inválido",
        description: "O código da conta deve seguir o formato: 0.0.00.00.0000",
        variant: "destructive",
      });
      return;
    }

    if (codeExists) {
      toast({
        title: "Código já existe",
        description: "Este código de conta já está sendo utilizado.",
        variant: "destructive",
      });
      return;
    }

    const newAccount: Account = {
      id: editingAccount?.id || Date.now().toString(),
      code: formData.code,
      description: formData.description,
      type: formData.type as 'ativo' | 'passivo' | 'patrimonio' | 'receita' | 'despesa',
      level: formData.code.split('.').length,
      parent: formData.parent === "none" ? undefined : formData.parent,
      isActive: true,
      createdAt: editingAccount?.createdAt || new Date()
    };

    onAccountSave(newAccount);

    // Reset form
    setFormData({ code: "", description: "", type: "", parent: "none" });
    setEditingAccount(null);

    toast({
      title: editingAccount ? "Conta atualizada" : "Conta criada",
      description: editingAccount 
        ? "A conta foi atualizada com sucesso." 
        : "A nova conta foi criada com sucesso.",
    });
  };

  const handleCancel = () => {
    setFormData({ code: "", description: "", type: "", parent: "none" });
    setEditingAccount(null);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="text-xl text-gray-800">
          {editingAccount ? 'Editar Conta Contábil' : 'Nova Conta Contábil'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AccountFormFields
            formData={formData}
            setFormData={setFormData}
            isCodeValid={isCodeValid}
            accounts={accounts}
            onCodeChange={handleCodeChange}
          />

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!isCodeValid || !formData.description || !formData.type}
            >
              <Save className="mr-2 h-4 w-4" />
              {editingAccount ? 'Atualizar Conta' : 'Criar Conta'}
            </Button>
            {editingAccount && (
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
