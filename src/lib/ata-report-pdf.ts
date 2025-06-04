
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ATAReportData {
  schoolName: string;
  purchasingCenterName: string;
  userName: string;
  date: string;
  reportType: 'school' | 'products';
  contracts: any[];
}

export const generateATAReportPDF = async (data: ATAReportData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Configurar fonte
  pdf.setFont('helvetica');
  
  // Cabeçalho
  pdf.setFontSize(18);
  pdf.setTextColor(1, 35, 64); // #012340
  pdf.text('RELATÓRIO DE ATAS DE REGISTRO DE PREÇOS', pageWidth / 2, 20, { align: 'center' });
  
  // Linha decorativa
  pdf.setDrawColor(1, 35, 64);
  pdf.setLineWidth(0.5);
  pdf.line(20, 25, pageWidth - 20, 25);
  
  // Informações do cabeçalho
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const headerInfo = [
    `Escola: ${data.schoolName}`,
    `Central de Compras: ${data.purchasingCenterName}`,
    `Usuário: ${data.userName}`,
    `Data de Geração: ${data.date}`,
    `Tipo de Relatório: ${data.reportType === 'school' ? 'Por Escola' : 'Por Produtos'}`
  ];
  
  let yPosition = 35;
  headerInfo.forEach((info, index) => {
    if (index % 2 === 0) {
      pdf.text(info, 20, yPosition);
    } else {
      pdf.text(info, pageWidth / 2 + 10, yPosition);
      yPosition += 6;
    }
  });
  
  // Linha separadora
  yPosition += 5;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;
  
  // Resumo estatístico
  pdf.setFontSize(12);
  pdf.setTextColor(1, 35, 64);
  pdf.text('RESUMO ESTATÍSTICO', 20, yPosition);
  yPosition += 8;
  
  const totalATAs = data.contracts.length;
  const totalItens = data.contracts.reduce((total, contract) => total + contract.items.length, 0);
  const valorTotal = data.contracts.reduce((total, contract) => 
    total + contract.items.reduce((itemTotal: number, item: any) => itemTotal + item.valorTotal, 0), 0
  );
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const resumoData = [
    ['Total de ATAs', totalATAs.toString()],
    ['Total de Itens', totalItens.toString()],
    ['Valor Total', `R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]
  ];
  
  (pdf as any).autoTable({
    startY: yPosition,
    head: [['Indicador', 'Valor']],
    body: resumoData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [1, 35, 64], textColor: 255 },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = (pdf as any).lastAutoTable.finalY + 15;
  
  // Tabela principal
  pdf.setFontSize(12);
  pdf.setTextColor(1, 35, 64);
  pdf.text('DETALHAMENTO DAS ATAS', 20, yPosition);
  yPosition += 8;
  
  if (data.reportType === 'school') {
    const tableData = data.contracts.map(contract => [
      contract.numeroATA || 'N/A',
      contract.fornecedor || 'N/A',
      new Date(contract.dataATA).toLocaleDateString('pt-BR'),
      new Date(contract.dataInicioVigencia).toLocaleDateString('pt-BR'),
      new Date(contract.dataFimVigencia).toLocaleDateString('pt-BR'),
      contract.items.length.toString(),
      `R$ ${contract.items.reduce((total: number, item: any) => total + item.valorTotal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);
    
    (pdf as any).autoTable({
      startY: yPosition,
      head: [['Nº ATA', 'Fornecedor', 'Data ATA', 'Início Vigência', 'Fim Vigência', 'Qtd Itens', 'Valor Total']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [1, 35, 64], textColor: 255 },
      margin: { left: 20, right: 20 },
      columnStyles: {
        6: { halign: 'right' }
      }
    });
  } else {
    // Relatório por produtos
    const tableData: string[][] = [];
    data.contracts.forEach(contract => {
      contract.items.forEach((item: any) => {
        tableData.push([
          item.numeroItem || 'N/A',
          item.descricaoProduto || 'N/A',
          item.quantidade.toString(),
          item.unidade || 'N/A',
          `R$ ${item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          contract.fornecedor || 'N/A'
        ]);
      });
    });
    
    (pdf as any).autoTable({
      startY: yPosition,
      head: [['Nº Item', 'Produto', 'Qtd', 'Unidade', 'Valor Unit.', 'Valor Total', 'Fornecedor']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [1, 35, 64], textColor: 255 },
      margin: { left: 20, right: 20 },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });
  }
  
  // Rodapé
  const finalY = (pdf as any).lastAutoTable.finalY;
  const pageHeight = pdf.internal.pageSize.height;
  
  if (finalY < pageHeight - 30) {
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Relatório gerado em ${new Date().toLocaleString('pt-BR')} - Sistema de Gestão de ATAs`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }
  
  // Salvar o PDF
  const fileName = `relatorio-atas-${data.reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};
