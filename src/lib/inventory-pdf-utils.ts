
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
}

export const generateInventoryReportPDF = async (data: InventoryReportData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Configure font
  pdf.setFont('helvetica');
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(1, 35, 64); // #012340
  
  let title = '';
  switch (data.reportType) {
    case 'current-stock':
      title = 'RELATÓRIO DE ESTOQUE ATUAL';
      break;
    case 'movements':
      title = 'RELATÓRIO DE MOVIMENTAÇÕES';
      break;
    case 'consumption':
      title = 'RELATÓRIO DE CONSUMO';
      break;
  }
  
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Decorative line
  pdf.setDrawColor(1, 35, 64);
  pdf.setLineWidth(0.5);
  pdf.line(20, 25, pageWidth - 20, 25);
  
  // Header information
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const headerInfo = [
    `Escola: ${data.schoolName}`,
    `Usuário: ${data.userName}`,
    `Data de Geração: ${data.date}`,
    data.dateRange ? `Período: ${data.dateRange.from.toLocaleDateString('pt-BR')} a ${data.dateRange.to.toLocaleDateString('pt-BR')}` : ''
  ].filter(Boolean);
  
  let yPosition = 35;
  headerInfo.forEach((info, index) => {
    if (index % 2 === 0) {
      pdf.text(info, 20, yPosition);
    } else {
      pdf.text(info, pageWidth / 2 + 10, yPosition);
      yPosition += 6;
    }
  });
  
  // Separator line
  yPosition += 5;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;
  
  // Generate specific report content
  if (data.reportType === 'current-stock' && data.stockData) {
    generateCurrentStockReport(pdf, data.stockData, yPosition);
  } else if (data.reportType === 'movements' && data.movements) {
    generateMovementsReport(pdf, data.movements, yPosition);
  } else if (data.reportType === 'consumption' && data.movements) {
    generateConsumptionReport(pdf, data.movements, yPosition);
  }
  
  // Footer
  const finalY = (pdf as any).lastAutoTable?.finalY || yPosition + 50;
  const pageHeight = pdf.internal.pageSize.height;
  
  if (finalY < pageHeight - 30) {
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Relatório gerado em ${new Date().toLocaleString('pt-BR')} - Sistema de Gestão de Estoque`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }
  
  // Save PDF
  const fileName = `relatorio-estoque-${data.reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
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
