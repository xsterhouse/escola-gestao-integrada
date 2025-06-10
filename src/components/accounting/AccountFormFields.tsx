
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

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

interface FormData {
  code: string;
  description: string;
  type: string;
  parent: string;
}

interface AccountFormFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isCodeValid: boolean;
  accounts: Account[];
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AccountFormFields({ 
  formData, 
  setFormData, 
  isCodeValid, 
  accounts, 
  onCodeChange 
}: AccountFormFieldsProps) {
  // Filter accounts to only include those with valid, non-empty codes
  const validAccounts = accounts.filter(account => account.code && account.code.trim() !== '');

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Código da Conta *
            {isCodeValid && <CheckCircle className="h-4 w-4 text-green-600" />}
          </Label>
          <Input
            id="code"
            placeholder="0.0.00.00.0000"
            value={formData.code}
            onChange={onCodeChange}
            className={`h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              formData.code && !isCodeValid ? 'border-red-500' : ''
            } ${isCodeValid ? 'border-green-500' : ''}`}
            maxLength={13}
          />
          {formData.code && !isCodeValid && (
            <p className="text-xs text-red-600">
              Formato inválido. Use: 0.0.00.00.0000 (1-9.1-9.01-99.01-99.0001-9999)
            </p>
          )}
          <p className="text-xs text-gray-500">
            Formato: 0.0.00.00.0000 (ex: 1.1.01.01.0001)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Descrição da Conta *
          </Label>
          <Input
            id="description"
            placeholder="Digite a descrição da conta"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium text-gray-700">
            Tipo da Conta *
          </Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="passivo">Passivo</SelectItem>
              <SelectItem value="patrimonio">Patrimônio Líquido</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent" className="text-sm font-medium text-gray-700">
            Conta Pai (Opcional)
          </Label>
          <Select value={formData.parent} onValueChange={(value) => setFormData(prev => ({ ...prev, parent: value }))}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione a conta pai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma (Conta Principal)</SelectItem>
              {validAccounts.map(account => (
                <SelectItem key={account.id} value={account.code}>
                  {account.code} - {account.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
