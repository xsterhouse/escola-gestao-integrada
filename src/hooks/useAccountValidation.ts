
import { useState, useCallback, useEffect } from 'react';
import { formatAccountMask, validateAccountCode, isValidAccountFormat } from '@/utils/accountMask';

interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestion?: string;
}

export function useAccountValidation() {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const accountsData = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');
    setAccounts(accountsData);
  }, []);

  const validateAccount = useCallback((accountCode: string): ValidationResult => {
    if (!accountCode) {
      return { isValid: false, message: 'Código da conta é obrigatório' };
    }

    if (!isValidAccountFormat(accountCode)) {
      return { 
        isValid: false, 
        message: 'Formato inválido. Use: 0.0.00.00.0000',
        suggestion: 'Exemplo: 1.1.01.01.0001'
      };
    }

    if (!validateAccountCode(accountCode)) {
      return { 
        isValid: false, 
        message: 'Código inválido. Verifique os valores permitidos',
        suggestion: 'Primeiro dígito: 1-9, Segundo: 1-9, etc.'
      };
    }

    const accountExists = accounts.find(acc => acc.code === accountCode);
    if (!accountExists) {
      return { 
        isValid: false, 
        message: 'Conta não encontrada no plano de contas',
        suggestion: 'Verifique se a conta está cadastrada'
      };
    }

    return { isValid: true, message: 'Conta válida' };
  }, [accounts]);

  const getAccountDescription = useCallback((accountCode: string): string => {
    const account = accounts.find(acc => acc.code === accountCode);
    return account ? account.description : '';
  }, [accounts]);

  const suggestAccounts = useCallback((input: string): any[] => {
    if (!input || input.length < 2) return [];
    
    return accounts
      .filter(acc => 
        acc.code.includes(input) || 
        acc.description.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5);
  }, [accounts]);

  const formatAndValidate = useCallback((value: string) => {
    const formatted = formatAccountMask(value);
    const validation = validateAccount(formatted);
    const description = validation.isValid ? getAccountDescription(formatted) : '';
    
    return {
      formatted,
      validation,
      description
    };
  }, [validateAccount, getAccountDescription]);

  return {
    validateAccount,
    getAccountDescription,
    suggestAccounts,
    formatAndValidate
  };
}
