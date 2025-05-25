
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product } from './types';

export const generateImprovedProductPDF = (products: Product[], title: string = "Relatório de Produtos") => {
  const doc = new jsPDF();
  const schoolName = "ESCOLA MUNICIPAL EXEMPLO"; // This would come from user context
  
  // Configurações gerais
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  let yPosition = 20;

  // Header do sistema
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SISTEMA DE GESTÃO ESCOLAR", pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(12);
  doc.text(schoolName, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;

  // Preparar dados da tabela
  const tableData = products.map((product) => [
    product.item.toString(),
    product.description,
    product.unit,
    product.quantity || "-",
    product.familyAgriculture ? "Sim" : "Não",
    product.indication || "-",
    product.restriction || "-"
  ]);

  // Configurar tabela
  autoTable(doc, {
    head: [['Item', 'Descrição', 'Unidade', 'Qtd', 'Agric. Familiar', 'Indicação', 'Restrição']],
    body: tableData,
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 15 }, // Item
      1: { cellWidth: 60 }, // Descrição
      2: { cellWidth: 20 }, // Unidade
      3: { cellWidth: 15 }, // Quantidade
      4: { cellWidth: 25 }, // Agricultura Familiar
      5: { cellWidth: 30 }, // Indicação
      6: { cellWidth: 30 }, // Restrição
    },
    didDrawPage: (data) => {
      // Footer com informações
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Página ${currentPage} de ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      
      // Informações do relatório no final da primeira página
      if (currentPage === 1 && data.cursor) {
        const finalY = data.cursor.y + 10;
        doc.setFontSize(9);
        doc.text(`Total de produtos: ${products.length}`, margin, finalY);
        doc.text(
          `Agricultura familiar: ${products.filter(p => p.familyAgriculture).length}`,
          margin,
          finalY + 6
        );
      }
    }
  });

  // Salvar o PDF
  const fileName = `relatorio-produtos-${Date.now()}.pdf`;
  doc.save(fileName);
};
