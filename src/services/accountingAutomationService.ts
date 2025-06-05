
import { AccountingEntry, AccountingAccount, BankTransaction, Invoice, PaymentAccount, ReceivableAccount } from "@/lib/types";

class AccountingAutomationService {
  private getAccountByCode(code: string): AccountingAccount | null {
    const accounts = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');
    return accounts.find((acc: AccountingAccount) => acc.code === code) || null;
  }

  private createAutomaticEntry(
    debitAccount: string,
    creditAccount: string,
    value: number,
    debitHistory: string,
    creditHistory: string,
    sourceModule: 'financial' | 'inventory' | 'contracts' | 'invoices',
    sourceDocumentId: string,
    schoolId: string,
    userId: string
  ): AccountingEntry {
    const debitAcc = this.getAccountByCode(debitAccount);
    const creditAcc = this.getAccountByCode(creditAccount);

    return {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      schoolId,
      date: new Date(),
      debitAccount,
      debitValue: value,
      debitDescription: debitAcc?.description || 'Conta não encontrada',
      debitHistory, // Histórico específico do débito
      creditAccount,
      creditValue: value,
      creditDescription: creditAcc?.description || 'Conta não encontrada',
      creditHistory, // Histórico específico do crédito
      history: `D: ${debitHistory} | C: ${creditHistory}`, // Combinação para compatibilidade
      totalValue: value,
      entryType: 'automatic',
      sourceModule,
      sourceDocumentId,
      reconciled: false,
      auditTrail: [{
        id: Date.now().toString(),
        entryId: '',
        action: 'created',
        userId,
        userName: 'Sistema Automático',
        timestamp: new Date(),
        reason: 'Lançamento automático gerado pelo sistema'
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      approved: true,
      approvedBy: 'Sistema',
      approvedAt: new Date()
    };
  }

  // Lançamento automático para pagamento
  generatePaymentEntry(payment: PaymentAccount, userId: string): AccountingEntry {
    const debitAccount = this.getExpenseAccountByType(payment.expenseType);
    const creditAccount = '1.1.1.01.01'; // Bancos - Conta Movimento

    const debitHistory = `Pagamento realizado: ${payment.description}`;
    const creditHistory = `Saída para pagamento: ${payment.description}`;

    return this.createAutomaticEntry(
      debitAccount,
      creditAccount,
      payment.value,
      debitHistory,
      creditHistory,
      'financial',
      payment.id,
      payment.schoolId,
      userId
    );
  }

  // Lançamento automático para recebimento
  generateReceivableEntry(receivable: ReceivableAccount, userId: string): AccountingEntry {
    const debitAccount = '1.1.1.01.01'; // Bancos - Conta Movimento
    const creditAccount = this.getRevenueAccountByType(receivable.resourceType);

    const debitHistory = `Recebimento de recurso: ${receivable.description}`;
    const creditHistory = `Entrada de recurso: ${receivable.description}`;

    return this.createAutomaticEntry(
      debitAccount,
      creditAccount,
      receivable.value,
      debitHistory,
      creditHistory,
      'financial',
      receivable.id,
      receivable.schoolId,
      userId
    );
  }

  // Lançamento automático para nota fiscal
  generateInvoiceEntry(invoice: Invoice, userId: string): AccountingEntry {
    const debitAccount = '1.1.4.01.01'; // Estoque de Materiais
    const creditAccount = '2.1.1.01.01'; // Fornecedores

    const debitHistory = `Entrada de mercadoria conforme NF: ${invoice.danfeNumber}`;
    const creditHistory = `Obrigação com fornecedor ${invoice.supplier.razaoSocial} - NF: ${invoice.danfeNumber}`;

    return this.createAutomaticEntry(
      debitAccount,
      creditAccount,
      invoice.totalValue,
      debitHistory,
      creditHistory,
      'invoices',
      invoice.id,
      invoice.supplierId,
      userId
    );
  }

  // Lançamento automático para transação bancária
  generateBankTransactionEntry(transaction: BankTransaction, userId: string): AccountingEntry {
    const debitAccount = transaction.transactionType === 'credito' ? '1.1.1.01.01' : this.getExpenseAccountByCategory(transaction.category);
    const creditAccount = transaction.transactionType === 'debito' ? '1.1.1.01.01' : this.getRevenueAccountByCategory(transaction.category);

    const debitHistory = transaction.transactionType === 'credito' 
      ? `Entrada bancária: ${transaction.description}`
      : `Saída bancária: ${transaction.description}`;
    
    const creditHistory = transaction.transactionType === 'credito'
      ? `Receita reconhecida: ${transaction.description}`
      : `Movimentação bancária: ${transaction.description}`;

    return this.createAutomaticEntry(
      debitAccount,
      creditAccount,
      transaction.value,
      debitHistory,
      creditHistory,
      'financial',
      transaction.id,
      transaction.schoolId,
      userId
    );
  }

  private getExpenseAccountByType(expenseType: string): string {
    const expenseMap: Record<string, string> = {
      'Material de Consumo': '3.3.9.30.01',
      'Serviços de Terceiros': '3.3.9.39.01',
      'Equipamentos': '4.4.9.52.01',
      'Outros': '3.3.9.39.99'
    };
    return expenseMap[expenseType] || '3.3.9.39.99';
  }

  private getRevenueAccountByType(resourceType: string): string {
    const revenueMap: Record<string, string> = {
      'PNAE': '4.1.1.01.01',
      'Recursos Próprios': '4.1.2.01.01',
      'PDDE': '4.1.1.02.01',
      'Outros': '4.1.9.99.99'
    };
    return revenueMap[resourceType] || '4.1.9.99.99';
  }

  private getExpenseAccountByCategory(category?: string): string {
    if (!category) return '3.3.9.39.99';
    
    const categoryMap: Record<string, string> = {
      'Alimentação': '3.3.9.30.01',
      'Transporte': '3.3.9.33.01',
      'Manutenção': '3.3.9.39.01',
      'Limpeza': '3.3.9.30.02'
    };
    return categoryMap[category] || '3.3.9.39.99';
  }

  private getRevenueAccountByCategory(category?: string): string {
    if (!category) return '4.1.9.99.99';
    
    const categoryMap: Record<string, string> = {
      'Transferência': '4.1.1.01.01',
      'Rendimento': '4.1.3.01.01',
      'Doação': '4.1.9.01.01'
    };
    return categoryMap[category] || '4.1.9.99.99';
  }

  // Processar lançamentos em lote
  processAutomaticEntries(entries: AccountingEntry[]): void {
    const existingEntries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const updatedEntries = [...existingEntries, ...entries];
    localStorage.setItem('accountingEntries', JSON.stringify(updatedEntries));
  }

  // Verificar se já existe lançamento para um documento
  entryExistsForDocument(sourceModule: string, sourceDocumentId: string): boolean {
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    return entries.some((entry: AccountingEntry) => 
      entry.sourceModule === sourceModule && entry.sourceDocumentId === sourceDocumentId
    );
  }
}

export const accountingAutomationService = new AccountingAutomationService();
