
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BankTransaction } from '@/lib/types';

interface TransactionPDFData {
  schoolName: string;
  purchasingCenter: string;
  transaction: BankTransaction;
}

export const generateTransactionPDF = (data: TransactionPDFData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text('Detalhes da Transação Bancária', 20, 25);
  
  // School and purchasing center info
  doc.setFontSize(12);
  doc.setTextColor(52, 73, 94);
  doc.text(`Escola: ${data.schoolName}`, 20, 40);
  doc.text(`Central de Compras: ${data.purchasingCenter}`, 20, 50);
  doc.text(`Data de Exportação: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 60);
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.setDrawColor(189, 195, 199);
  doc.line(20, 70, 190, 70);
  
  // Transaction details
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const transactionData = [
    ['Data da Transação', format(new Date(data.transaction.date), 'dd/MM/yyyy')],
    ['Descrição', data.transaction.description],
    ['Tipo', data.transaction.transactionType === 'credito' ? 'Crédito' : 'Débito'],
    ['Valor', formatCurrency(data.transaction.value)],
    ['Status de Conciliação', data.transaction.reconciliationStatus === 'conciliado' ? 'Conciliado' : 'Pendente'],
    ['Categoria', data.transaction.category || 'Não informado'],
    ['Tipo de Recurso', data.transaction.resourceType || 'Não informado'],
    ['Origem', data.transaction.source === 'payment' ? 'Pagamento' : 
              data.transaction.source === 'receivable' ? 'Recebimento' : 'Manual'],
    ['Criado em', format(new Date(data.transaction.createdAt), 'dd/MM/yyyy HH:mm')],
    ['Atualizado em', format(new Date(data.transaction.updatedAt), 'dd/MM/yyyy HH:mm')]
  ];

  if (data.transaction.isDuplicate) {
    transactionData.push(['Status', 'Transação em Duplicidade']);
    if (data.transaction.duplicateJustification) {
      transactionData.push(['Justificativa', data.transaction.duplicateJustification]);
    }
  }

  // Create table
  (doc as any).autoTable({
    startY: 80,
    head: [['Campo', 'Valor']],
    body: transactionData,
    theme: 'grid',
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontSize: 12,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [236, 240, 241] },
      1: { cellWidth: 120 }
    },
    margin: { left: 20, right: 20 }
  });

  // Footer with generation info
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(127, 140, 141);
  doc.text('Documento gerado automaticamente pelo Sistema de Gestão Escolar', 20, pageHeight - 20);
  doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`, 20, pageHeight - 10);

  // Save the PDF
  const fileName = `transacao-${data.transaction.id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};
