
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SchoolReportData {
  schoolName: string;
  purchasingCenterName: string;
  userName: string;
  date: string;
  time: string;
  atas: any[];
  reportType: 'school' | 'product';
}

export const generatePlanningReportPDF = (data: SchoolReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Header with logo area
  doc.setFillColor(1, 35, 64); // #012340
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Planejamento', margin, 25);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Report information section
  let yPosition = 60;
  
  // Information box
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 45, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações do Relatório:', margin + 5, yPosition + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const infoData = [
    ['Escola:', data.schoolName],
    ['Central de Compras:', data.purchasingCenterName],
    ['Usuário:', data.userName],
    ['Data de Geração:', data.date],
    ['Hora de Geração:', data.time]
  ];
  
  infoData.forEach((item, index) => {
    const x = margin + 5;
    const y = yPosition + 15 + (index * 6);
    
    doc.setFont('helvetica', 'bold');
    doc.text(item[0], x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(item[1], x + 35, y);
  });
  
  yPosition += 60;
  
  // Statistics section
  const totalATAs = data.atas.length;
  const totalItems = data.atas.reduce((total, ata) => total + (ata.items?.length || 0), 0);
  const atasAtivas = data.atas.filter(ata => ata.status === 'aprovada').length;
  
  doc.setFillColor(230, 244, 255);
  doc.rect(margin, yPosition, pageWidth - (margin * 2), 30, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Estatístico:', margin + 5, yPosition + 12);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de ATAs: ${totalATAs}`, margin + 5, yPosition + 20);
  doc.text(`ATAs Ativas: ${atasAtivas}`, margin + 70, yPosition + 20);
  doc.text(`Total de Itens: ${totalItems}`, margin + 140, yPosition + 20);
  
  yPosition += 45;
  
  // ATAs table
  if (data.atas.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de ATAs:', margin, yPosition);
    
    yPosition += 10;
    
    const tableData = data.atas.map(ata => [
      ata.numeroATA || 'N/A',
      ata.dataATA || 'N/A',
      `${ata.dataInicioVigencia || 'N/A'} - ${ata.dataFimVigencia || 'N/A'}`,
      ata.status === 'rascunho' ? 'Rascunho' : 
      ata.status === 'finalizada' ? 'Finalizada' : 
      ata.status === 'aprovada' ? 'Aprovada' : ata.status,
      (ata.items?.length || 0).toString()
    ]);
    
    (doc as any).autoTable({
      head: [['Número ATA', 'Data ATA', 'Vigência', 'Status', 'Qtd. Itens']],
      body: tableData,
      startY: yPosition,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [1, 35, 64],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1
    });
  }
  
  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    
    const footerText = `Página ${i} de ${totalPages} - Gerado em ${data.date} às ${data.time}`;
    const textWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - textWidth) / 2, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  const fileName = `relatorio-planejamento-${data.schoolName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
