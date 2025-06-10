
import { useEffect, useState } from "react";
import { applyAccountMask, isValidAccountFormat, validateAccountCode } from "@/utils/accountMask";

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

interface ValidationResult {
  isCodeValid: boolean;
  codeExists: boolean;
}

export function useAccountValidation(
  code: string, 
  accounts: Account[], 
  editingAccountId?: string
): ValidationResult {
  const [isCodeValid, setIsCodeValid] = useState(false);

  useEffect(() => {
    if (code) {
      const isValid = isValidAccountFormat(code) && validateAccountCode(code);
      setIsCodeValid(isValid);
    } else {
      setIsCodeValid(false);
    }
  }, [code]);

  const codeExists = accounts.some(acc => 
    acc.code === code && (!editingAccountId || acc.id !== editingAccountId)
  );

  return { isCodeValid, codeExists };
}

export function formatAccountCode(inputValue: string): string {
  return applyAccountMask(inputValue);
}

export function getAccountTypeLabel(type: string): string {
  const types = {
    ativo: 'Ativo',
    passivo: 'Passivo', 
    patrimonio: 'Patrimônio Líquido',
    receita: 'Receita',
    despesa: 'Despesa'
  };
  return types[type as keyof typeof types] || type;
}

export function getAccountTypeBadgeColor(type: string): string {
  const colors = {
    ativo: 'bg-blue-100 text-blue-800',
    passivo: 'bg-red-100 text-red-800',
    patrimonio: 'bg-purple-100 text-purple-800',
    receita: 'bg-green-100 text-green-800',
    despesa: 'bg-orange-100 text-orange-800'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}
