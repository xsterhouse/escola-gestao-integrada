import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice, InventoryMovement } from '@/lib/types';
import { getAllProductsStock, StockCalculation } from './inventory-calculations';

interface InventoryReportData {
  schoolName: string;
  userName: string;
  date: string;
  reportType: 'current-stock' | 'movements' | 'consumption';
  stockData?: StockCalculation[];
  movements?: InventoryMovement[];
  dateRange?: { from: Date; to: Date };
  selectedInvoices?: Invoice[];
  lowStockThreshold?: number;
}

export const generateInventoryReportPDF = async (data: InventoryReportData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Configure font
  pdf.setFont('helvetica');
  
  // Modern Header Design
  generateModernHeader(pdf, data, pageWidth);
  
  let startY = 80;
  
  // Generate specific report content
  if (data.reportType === 'current-stock' && data.stockData) {
    if (data.lowStockThreshold) {
      generateLowStockReport(pdf, data.stockData, startY, data.lowStockThreshold);
    } else {
      generateCurrentStockReport(pdf, data.stockData, startY);
    }
  } else if (data.reportType === 'movements' && data.movements) {
    if (data.selectedInvoices) {
      generateInvoiceSpecificReport(pdf, data.movements, data.selectedInvoices, startY);
    } else {
      generateMovementsReport(pdf, data.movements, startY);
    }
  } else if (data.reportType === 'consumption' && data.movements) {
    generateConsumptionReport(pdf, data.movements, startY);
  }
  
  // Modern Footer
  generateModernFooter(pdf);
  
  // Save PDF with descriptive name
  const fileName = generateFileName(data);
  pdf.save(fileName);
};

const generateModernHeader = (pdf: jsPDF, data: InventoryReportData, pageWidth: number) => {
  // Background gradient effect (simulated with rectangles)
  pdf.setFillColor(1, 35, 64); // #012340
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  // Main title
  pdf.setFontSize(20);
  pdf.setTextColor(255, 255, 255);
  
  let title = '';
  switch (data.reportType) {
    case 'current-stock':
      title = data.lowStockThreshold ? 'RELATÓRIO DE BAIXO ESTOQUE' : 'RELATÓRIO DE ESTOQUE ATUAL';
      break;
    case 'movements':
      title = data.selectedInvoices ? 'RELATÓRIO POR NOTA FISCAL' : 'RELATÓRIO DE MOVIMENTAÇÕES';
      break;
    case 'consumption':
      title = 'RELATÓRIO DE CONSUMO';
      break;
  }
  
  pdf.text(title, pageWidth / 2, 16, { align: 'center' });
  
  // School and system info section
  pdf.setFillColor(248, 250, 252); // Light gray background
  pdf.rect(0, 25, pageWidth, 40, 'F');
  
  // School information
  pdf.setFontSize(14);
  pdf.setTextColor(1, 35, 64);
  pdf.text('SIGRE - Sistema Integrado de Gestão de Recursos Escolares', pageWidth / 2, 35, { align: 'center' });
  
  // Information grid
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const leftColumn = 25;
  const rightColumn = pageWidth / 2 + 10;
  let yPos = 45;
  
  // Left column
  pdf.setFont('helvetica', 'bold');
  pdf.text('Escola:', leftColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.schoolName, leftColumn + 25, yPos);
  
  // Right column
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data de Geração:', rightColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.date, rightColumn + 35, yPos);
  
  yPos += 8;
  
  // Second row
  pdf.setFont('helvetica', 'bold');
  pdf.text('Usuário:', leftColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.userName, leftColumn + 25, yPos);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Horário:', rightColumn, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date().toLocaleTimeString('pt-BR'), rightColumn + 35, yPos);
  
  // Special info for specific reports
  if (data.selectedInvoices && data.selectedInvoices.length > 0) {
    yPos += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notas Fiscais:', leftColumn, yPos);
    pdf.setFont('helvetica', 'normal');
    const invoiceNumbers = data.selectedInvoices.map(inv => inv.danfeNumber).join(', ');
    pdf.text(invoiceNumbers, leftColumn + 35, yPos);
  }
  
  if (data.lowStockThreshold) {
    yPos += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Limite de Estoque:', leftColumn, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.lowStockThreshold} unidades`, leftColumn + 40, yPos);
  }
  
  // Decorative line
  pdf.setDrawColor(1, 35, 64);
  pdf.setLineWidth(1);
  pdf.line(20, 70, pageWidth - 20, 70);
};

const generateInvoiceSpecificReport = (pdf: jsPDF, movements: InventoryMovement[], selectedInvoices: Invoice[], startY: number) => {
  pdf.setFontSize(14);
  pdf.setTextColor(1, 35, 64);
  pdf.text('ITENS POR NOTA FISCAL', 20, startY);
  startY += 15;
  
  selectedInvoices.forEach((invoice, index) => {
    const invoiceMovements = movements.filter(mov => mov.invoiceId === invoice.id);
    
    if (invoiceMovements.length === 0) return;
    
    // Invoice header
    pdf.setFontSize(12);
    pdf.setTextColor(1, 35, 64);
    pdf.text(`Nota Fiscal ${invoice.danfeNumber} - ${invoice.supplier.name}`, 20, startY);
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Data: ${new Date(invoice.issueDate).toLocaleDateString('pt-BR')} | Valor Total: R$ ${invoice.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, startY + 6);
    
    startY += 15;
    
    // Items table
    const tableData = invoiceMovements.map(movement => [
      movement.productDescription,
      movement.quantity.toString(),
      movement.unitOfMeasure,
      `R$ ${movement.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${movement.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);
    
    (pdf as any).autoTable({
      startY,
      head: [['Produto', 'Qtd', 'Unidade', 'Valor Unit.', 'Valor Total']],
      body: tableData,
      theme: 'striped',
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [1, 35, 64], 
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });
    
    startY = (pdf as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (startY > 250 && index < selectedInvoices.length - 1) {
      pdf.addPage();
      startY = 20;
    }
  });
};

const generateLowStockReport = (pdf: jsPDF, stockData: StockCalculation[], startY: number, threshold: number) => {
  // Alert section
  pdf.setFillColor(254, 242, 242); // Red background
  pdf.rect(20, startY, pdf.internal.pageSize.width - 40, 20, 'F');
  
  pdf.setFontSize(12);
  pdf.setTextColor(185, 28, 28); // Red text
  pdf.text(`⚠️ ALERTA: ${stockData.length} produtos com estoque abaixo de ${threshold} unidades`, 25, startY + 8);
  pdf.text('Reposição urgente necessária!', 25, startY + 15);
  
  startY += 30;
  
  // Low stock table
  pdf.setFontSize(12);
  pdf.setTextColor(1, 35, 64);
  pdf.text('PRODUTOS COM BAIXO ESTOQUE', 20, startY);
  startY += 8;
  
  const tableData = stockData.map(item => [
    item.productDescription,
    item.unitOfMeasure,
    item.currentStock.toString(),
    `R$ ${item.averageUnitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    item.currentStock <= 5 ? 'CRÍTICO' : 'BAIXO'
  ]);
  
  (pdf as any).autoTable({
    startY,
    head: [['Produto', 'Unidade', 'Estoque', 'Custo Médio', 'Valor Total', 'Status']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [185, 28, 28], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: function(data: any) {
      if (data.column.index === 5) {
        if (data.cell.raw === 'CRÍTICO') {
          data.cell.styles.fillColor = [254, 226, 226];
          data.cell.styles.textColor = [185, 28, 28];
        } else {
          data.cell.styles.fillColor = [255, 247, 237];
          data.cell.styles.textColor = [194, 120, 3];
        }
      }
    }
  });
};

const generateCurrentStockReport = (pdf: jsPDF, stockData: StockCalculation[], startY: number) => {
  // Summary statistics
  pdf.setFontSize(12);
  pdf.setTextColor(1, 35, 64);
  pdf.text('RESUMO ESTATÍSTICO', 20, startY);
  startY += 8;
  
  const totalProducts = stockData.length;
  const totalValue = stockData.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = stockData.filter(item => item.currentStock <= 10).length;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const summaryData = [
    ['Total de Produtos', totalProducts.toString()],
    ['Valor Total do Estoque', `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    ['Produtos com Estoque Baixo', lowStockItems.toString()]
  ];
  
  (pdf as any).autoTable({
    startY,
    head: [['Indicador', 'Valor']],
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [1, 35, 64], textColor: 255 },
    margin: { left: 20, right: 20 }
  });
  
  startY = (pdf as any).lastAutoTable.finalY + 15;
  
  // Current stock table
  pdf.setFontSize(12);
  pdf.setTextColor(1, 35, 64);
  pdf.text('ESTOQUE ATUAL POR PRODUTO', 20, startY);
  startY += 8;
  
  const tableData = stockData.map(item => [
    item.productDescription,
    item.unitOfMeasure,
    item.currentStock.toString(),
    `R$ ${item.averageUnitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  ]);
  
  (pdf as any).autoTable({
    startY,
    head: [['Produto', 'Unidade', 'Quantidade', 'Custo Médio', 'Valor Total']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [1, 35, 64], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });
};

const generateMovementsReport = (pdf: jsPDF, movements: InventoryMovement[], startY: number) => {
  // Movements table
  pdf.setFontSize(12);
  pdf.setTextColor(1, 35, 64);
  pdf.text('MOVIMENTAÇÕES DE ESTOQUE', 20, startY);
  startY += 8;
  
  const tableData = movements.map(movement => [
    movement.type === 'entrada' ? 'Entrada' : 'Saída',
    new Date(movement.date).toLocaleDateString('pt-BR'),
    movement.productDescription,
    movement.quantity.toString(),
    movement.unitOfMeasure,
    `R$ ${movement.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${movement.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    movement.source === 'manual' ? 'Manual' : 'NF'
  ]);
  
  (pdf as any).autoTable({
    startY,
    head: [['Tipo', 'Data', 'Produto', 'Qtd', 'Unidade', 'Valor Unit.', 'Valor Total', 'Origem']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [1, 35, 64], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });
};

const generateConsumptionReport = (pdf: jsPDF, movements: InventoryMovement[], startY: number) => {
  // Filter only exit movements
  const exitMovements = movements.filter(m => m.type === 'saida');
  
  // Group by product
  const consumptionByProduct = exitMovements.reduce((acc, movement) => {
    const key = `${movement.productDescription}-${movement.unitOfMeasure}`;
    if (!acc[key]) {
      acc[key] = {
        product: movement.productDescription,
        unit: movement.unitOfMeasure,
        totalQuantity: 0,
        totalValue: 0
      };
    }
    acc[key].totalQuantity += movement.quantity;
    acc[key].totalValue += movement.totalCost;
    return acc;
  }, {} as Record<string, any>);
  
  pdf.setFontSize(12);
  pdf.setTextColor(1, 35, 64);
  pdf.text('RELATÓRIO DE CONSUMO POR PRODUTO', 20, startY);
  startY += 8;
  
  const tableData = Object.values(consumptionByProduct).map((item: any) => [
    item.product,
    item.unit,
    item.totalQuantity.toString(),
    `R$ ${item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  ]);
  
  (pdf as any).autoTable({
    startY,
    head: [['Produto', 'Unidade', 'Quantidade Consumida', 'Valor Total']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [1, 35, 64], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      3: { halign: 'right' }
    }
  });
};

const generateModernFooter = (pdf: jsPDF) => {
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  
  // Footer background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
  
  // Footer content
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    'SIGRE - Sistema Integrado de Gestão de Recursos Escolares',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );
  pdf.text(
    `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );
};

const generateFileName = (data: InventoryReportData): string => {
  const dateSuffix = new Date().toISOString().split('T')[0];
  const schoolName = data.schoolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  let typePrefix = '';
  switch (data.reportType) {
    case 'current-stock':
      typePrefix = data.lowStockThreshold ? 'baixo_estoque' : 'estoque_atual';
      break;
    case 'movements':
      typePrefix = data.selectedInvoices ? 'por_nota_fiscal' : 'movimentacoes';
      break;
    case 'consumption':
      typePrefix = 'consumo';
      break;
  }
  
  return `relatorio_${typePrefix}_${schoolName}_${dateSuffix}.pdf`;
};
