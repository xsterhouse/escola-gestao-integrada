import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Product, Invoice, InventoryReport, PurchaseReport, InventoryMovement, Planning } from "./types";

// Original generatePDF function for products
export const generatePDF = (products: Product[]) => {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Lista de Produtos", 14, 22);
  
  // Add date
  doc.setFontSize(11);
  const date = new Date().toLocaleString();
  doc.text(`Gerado em: ${date}`, 14, 30);
  
  // Define columns
  const columns = [
    { header: "Item", dataKey: "item" },
    { header: "Descrição", dataKey: "description" },
    { header: "Unidade", dataKey: "unit" },
    { header: "Quantidade", dataKey: "quantity" },
    { header: "Agric. Familiar", dataKey: "familyAgriculture" },
    { header: "Indicação", dataKey: "indication" },
    { header: "Restrição", dataKey: "restriction" }
  ];
  
  // Format data
  const data = products.map((product) => ({
    item: product.item.toString(),
    description: product.description,
    unit: product.unit,
    quantity: product.quantity || "-",
    familyAgriculture: product.familyAgriculture ? "Sim" : "Não",
    indication: product.indication || "Não informado",
    restriction: product.restriction || "Não informado"
  }));
  
  // Create table
  autoTable(doc, {
    startY: 40,
    head: [columns.map(column => column.header)],
    body: data.map(row => columns.map(column => row[column.dataKey as keyof typeof row])),
    headStyles: {
      fillColor: [1, 35, 64], // #012340
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      fontSize: 9, // Slightly smaller font to fit all columns
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 15 }, // Item
      1: { cellWidth: "auto" }, // Description (flexible)
      2: { cellWidth: 20 }, // Unit
      3: { cellWidth: 20 }, // Quantity
      4: { cellWidth: 25 }, // Family Agriculture
      5: { cellWidth: 30 }, // Indication
      6: { cellWidth: 30 }  // Restriction
    },
    margin: { top: 40 }
  });
  
  // Get footer y position
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  // Add footer
  doc.setFontSize(10);
  doc.text(`Total de produtos: ${products.length}`, 14, finalY + 15);
  
  // Save the PDF
  doc.save("produtos.pdf");
};

// Function for exporting inventory data
export const generateInventoryPDF = (invoices: Invoice[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Relatório de Estoque", 14, 22);
  
  // Add date
  doc.setFontSize(11);
  const date = new Date().toLocaleString();
  doc.text(`Gerado em: ${date}`, 14, 30);
  
  // Define columns
  const columns = [
    { header: "Fornecedor", dataKey: "supplier" },
    { header: "CNPJ", dataKey: "cnpj" },
    { header: "Data Emissão", dataKey: "issueDate" },
    { header: "DANFE", dataKey: "danfe" },
    { header: "Total Itens", dataKey: "totalItems" },
    { header: "Valor Total", dataKey: "totalValue" }
  ];
  
  // Format data
  const data = invoices.map((invoice) => ({
    supplier: invoice.supplier.name,
    cnpj: invoice.supplier.cnpj,
    issueDate: new Date(invoice.issueDate).toLocaleDateString(),
    danfe: invoice.danfeNumber,
    totalItems: invoice.items.length.toString(),
    totalValue: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(invoice.totalValue)
  }));
  
  // Create table
  autoTable(doc, {
    startY: 40,
    head: [columns.map(column => column.header)],
    body: data.map(row => columns.map(column => row[column.dataKey as keyof typeof row])),
    headStyles: {
      fillColor: [1, 35, 64], // #012340
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { top: 40 }
  });
  
  // Get footer y position
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  // Add footer
  doc.setFontSize(10);
  doc.text(`Total de notas fiscais: ${invoices.length}`, 14, finalY + 15);
  
  // Save the PDF
  doc.save("estoque.pdf");
};

// Function for exporting inventory report
export const generateInventoryReportPDF = (reports: InventoryReport[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Relatório de Produtos em Estoque", 14, 22);
  
  // Add date
  doc.setFontSize(11);
  const date = new Date().toLocaleString();
  doc.text(`Gerado em: ${date}`, 14, 30);
  
  // Define columns
  const columns = [
    { header: "Código", dataKey: "code" },
    { header: "Produto", dataKey: "name" },
    { header: "Última Entrada", dataKey: "lastEntry" },
    { header: "Fornecedor", dataKey: "supplier" },
    { header: "Qtd. Atual", dataKey: "quantity" },
    { header: "Custo Unit.", dataKey: "unitCost" },
    { header: "Custo Total", dataKey: "totalCost" }
  ];
  
  // Format data
  const data = reports.map((report) => ({
    code: report.productCode,
    name: report.productName,
    lastEntry: new Date(report.lastEntryDate).toLocaleDateString(),
    supplier: report.supplierName,
    quantity: report.currentQuantity.toString(),
    unitCost: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(report.unitCost),
    totalCost: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(report.totalCost)
  }));
  
  // Create table
  autoTable(doc, {
    startY: 40,
    head: [columns.map(column => column.header)],
    body: data.map(row => columns.map(column => row[column.dataKey as keyof typeof row])),
    headStyles: {
      fillColor: [1, 35, 64],
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { top: 40 }
  });
  
  // Save the PDF
  doc.save("relatorio-estoque.pdf");
};

// Function for exporting purchases report
export const generatePurchaseReportPDF = (reports: PurchaseReport[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Relatório de Compras", 14, 22);
  
  // Add date
  doc.setFontSize(11);
  const date = new Date().toLocaleString();
  doc.text(`Gerado em: ${date}`, 14, 30);
  
  // Define columns
  const columns = [
    { header: "Código", dataKey: "code" },
    { header: "Descrição", dataKey: "description" },
    { header: "Fornecedor", dataKey: "supplier" },
    { header: "Data Entrada", dataKey: "date" },
    { header: "Quantidade", dataKey: "quantity" },
    { header: "Unidade", dataKey: "unit" },
    { header: "Valor", dataKey: "value" },
    { header: "Saldo Atual", dataKey: "balance" }
  ];
  
  // Format data
  const data = reports.map((report) => ({
    code: report.productCode,
    description: report.description,
    supplier: report.supplier,
    date: new Date(report.entryDate).toLocaleDateString(),
    quantity: report.quantity.toString(),
    unit: report.unitOfMeasure,
    value: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(report.value),
    balance: report.currentBalance.toString()
  }));
  
  // Create table
  autoTable(doc, {
    startY: 40,
    head: [columns.map(column => column.header)],
    body: data.map(row => columns.map(column => row[column.dataKey as keyof typeof row])),
    headStyles: {
      fillColor: [1, 35, 64],
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { top: 40 }
  });
  
  // Save the PDF
  doc.save("relatorio-compras.pdf");
};

// Function for exporting inventory movements to PDF
export const generateInventoryMovementsPDF = (movements: InventoryMovement[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Relatório de Movimentações de Estoque", 14, 22);
  
  // Add date
  doc.setFontSize(11);
  const date = new Date().toLocaleString();
  doc.text(`Gerado em: ${date}`, 14, 30);
  
  // Define columns
  const columns = [
    { header: "Tipo", dataKey: "type" },
    { header: "Data", dataKey: "date" },
    { header: "Produto", dataKey: "product" },
    { header: "Quantidade", dataKey: "quantity" },
    { header: "Unidade", dataKey: "unit" },
    { header: "Valor Unitário", dataKey: "unitValue" },
    { header: "Valor Total", dataKey: "totalValue" },
    { header: "Origem", dataKey: "source" }
  ];
  
  // Format data
  const data = movements.map((movement) => ({
    type: movement.type === 'entrada' ? 'Entrada' : 'Saída',
    date: new Date(movement.date).toLocaleDateString(),
    product: movement.productDescription,
    quantity: movement.quantity.toString(),
    unit: movement.unitOfMeasure,
    unitValue: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(movement.unitPrice),
    totalValue: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(movement.totalCost),
    source: movement.source === 'manual' ? 'Manual' : 
            movement.source === 'invoice' ? 'Nota Fiscal' : 'Sistema'
  }));
  
  // Create table
  autoTable(doc, {
    startY: 40,
    head: [columns.map(column => column.header)],
    body: data.map(row => columns.map(column => row[column.dataKey as keyof typeof row])),
    headStyles: {
      fillColor: [1, 35, 64],
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { top: 40 }
  });
  
  // Get footer y position
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  // Add footer
  doc.setFontSize(10);
  doc.text(`Total de movimentações: ${movements.length}`, 14, finalY + 15);
  
  // Save the PDF
  doc.save("movimentacoes-estoque.pdf");
};

// Function to export data to CSV format
export const exportToCsv = <T extends object>(
  data: T[], 
  filename: string, 
  columns: {header: string, key: string}[]
) => {
  // Create CSV header
  const header = columns.map(col => col.header).join(',');
  
  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key as keyof T];
      
      // Format dates
      if (value instanceof Date) {
        value = formatDate(value, 'dd/MM/yyyy') as any;
      }
      
      // Format currency values
      if (typeof value === 'number' && 
          (col.key.includes('cost') || col.key.includes('price') || 
           col.key.includes('value') || col.key.includes('Cost') || 
           col.key.includes('Price') || col.key.includes('Value'))) {
        value = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value) as any;
      }
      
      // Handle objects, null or undefined values
      if (value === null || value === undefined) {
        value = '' as any;
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        value = JSON.stringify(value) as any;
      }
      
      // Escape commas and quotes
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"` as any;
        }
      }
      
      return value;
    }).join(',');
  }).join('\n');
  
  // Combine header and rows
  const csv = `${header}\n${rows}`;
  
  // Create a download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to format dates for CSV
function formatDate(date: Date, formatStr: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  // Use string replacement instead of treating formatStr as a function
  return formatStr.replace('dd', day).replace('MM', month).replace('yyyy', year.toString());
}

// New function for generating modern financial reports
export const generateModernFinancialReportPDF = (reportData: {
  title: string;
  reportType: string;
  period: string;
  filters: {
    resourceType?: string;
    supplier?: string;
    status?: string;
  };
  schoolName: string;
  purchasingCenters: string[];
  userName: string;
  data: any[];
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  };
}) => {
  const doc = new jsPDF();
  
  // Header - Company/System info
  doc.setFontSize(20);
  doc.setTextColor(1, 28, 67); // #012340
  doc.text("SIGRE - Sistema de Gestão de Recursos Educacionais", 14, 20);
  
  // School and user information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Escola: ${reportData.schoolName}`, 14, 32);
  
  // Purchasing centers
  if (reportData.purchasingCenters.length > 0) {
    doc.text(`Centrais de Compras: ${reportData.purchasingCenters.join(', ')}`, 14, 40);
  }
  
  doc.text(`Usuário: ${reportData.userName}`, 14, 48);
  doc.text(`Data de Exportação: ${new Date().toLocaleString('pt-BR')}`, 14, 56);
  
  // Report title and filters
  doc.setFontSize(16);
  doc.setTextColor(1, 28, 67);
  doc.text(reportData.title, 14, 72);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let filterY = 80;
  
  doc.text(`Período: ${reportData.period}`, 14, filterY);
  
  if (reportData.filters.resourceType && reportData.filters.resourceType !== "all") {
    filterY += 6;
    doc.text(`Tipo de Recurso: ${reportData.filters.resourceType}`, 14, filterY);
  }
  
  if (reportData.filters.supplier) {
    filterY += 6;
    doc.text(`Fornecedor/Origem: ${reportData.filters.supplier}`, 14, filterY);
  }
  
  if (reportData.filters.status && reportData.filters.status !== "all") {
    filterY += 6;
    doc.text(`Status: ${reportData.filters.status}`, 14, filterY);
  }
  
  // Executive summary
  let summaryY = filterY + 15;
  doc.setFontSize(12);
  doc.setTextColor(1, 28, 67);
  doc.text("Resumo Executivo", 14, summaryY);
  
  summaryY += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Summary boxes
  const boxWidth = 60;
  const boxHeight = 20;
  const spacing = 5;
  
  // Total Receitas box
  doc.setFillColor(34, 197, 94); // green-500
  doc.rect(14, summaryY, boxWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text("Total Receitas", 16, summaryY + 6);
  doc.setFontSize(12);
  doc.text(new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reportData.summary.totalReceitas), 16, summaryY + 14);
  
  // Total Despesas box
  doc.setFillColor(239, 68, 68); // red-500
  doc.rect(14 + boxWidth + spacing, summaryY, boxWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("Total Despesas", 16 + boxWidth + spacing, summaryY + 6);
  doc.setFontSize(12);
  doc.text(new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reportData.summary.totalDespesas), 16 + boxWidth + spacing, summaryY + 14);
  
  // Saldo box
  const saldoColor = reportData.summary.saldo >= 0 ? [34, 197, 94] : [239, 68, 68];
  doc.setFillColor(saldoColor[0], saldoColor[1], saldoColor[2]);
  doc.rect(14 + (boxWidth + spacing) * 2, summaryY, boxWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("Saldo", 16 + (boxWidth + spacing) * 2, summaryY + 6);
  doc.setFontSize(12);
  doc.text(new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reportData.summary.saldo), 16 + (boxWidth + spacing) * 2, summaryY + 14);
  
  // Data table
  const tableStartY = summaryY + boxHeight + 15;
  
  doc.setFontSize(12);
  doc.setTextColor(1, 28, 67);
  doc.text("Detalhamento", 14, tableStartY - 5);
  
  // Define columns based on report type
  let columns: any[];
  let tableData: any[];
  
  if (reportData.reportType === "resource") {
    columns = [
      { header: "Tipo", dataKey: "tipo" },
      { header: "Descrição", dataKey: "descricao" },
      { header: "Categoria", dataKey: "categoria" },
      { header: "Data", dataKey: "data" },
      { header: "Valor", dataKey: "valor" },
      { header: "Status", dataKey: "status" }
    ];
  } else {
    columns = [
      { header: "Tipo", dataKey: "tipo" },
      { header: "Descrição", dataKey: "descricao" },
      { header: "Fornecedor/Origem", dataKey: "fornecedor_origem" },
      { header: "Data", dataKey: "data" },
      { header: "Valor", dataKey: "valor" },
      { header: "Situação", dataKey: "situacao" }
    ];
  }
  
  tableData = reportData.data.map(item => {
    const row: any = {};
    columns.forEach(col => {
      row[col.dataKey] = item[col.dataKey] || "-";
    });
    return row;
  });
  
  // Create table
  autoTable(doc, {
    startY: tableStartY,
    head: [columns.map(column => column.header)],
    body: tableData.length > 0 ? 
      tableData.map(row => columns.map(column => row[column.dataKey])) :
      [["Não há dados para exibir no período selecionado.", "", "", "", "", ""]],
    headStyles: {
      fillColor: [1, 28, 67], // #012340
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // gray-50
    },
    styles: {
      fontSize: 8,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Tipo
      1: { cellWidth: 50 }, // Descrição
      2: { cellWidth: 35 }, // Categoria/Fornecedor
      3: { cellWidth: 25 }, // Data
      4: { cellWidth: 30 }, // Valor
      5: { cellWidth: 25 }  // Status/Situação
    },
    margin: { top: tableStartY }
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, 14, finalY + 15);
  doc.text(`Total de registros: ${reportData.data.length}`, 14, finalY + 22);
  doc.text("SIGRE - Sistema de Gestão de Recursos Educacionais", 14, finalY + 29);
  
  // Open in browser instead of downloading
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};

// New function for generating financial reports
export const generateFinancialReportPDF = (reportData: {
  title: string;
  period: string;
  bankAccount: string;
  accountType: string;
  status: string;
  data: any[];
}) => {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(reportData.title, 14, 22);
  
  // Add date and filters info
  doc.setFontSize(11);
  const date = new Date().toLocaleString();
  doc.text(`Gerado em: ${date}`, 14, 30);
  doc.text(`Período: ${reportData.period}`, 14, 38);
  doc.text(`Banco: ${reportData.bankAccount}`, 14, 46);
  doc.text(`Tipo de Conta: ${reportData.accountType}`, 14, 54);
  doc.text(`Status: ${reportData.status}`, 14, 62);
  
  // Define columns for the report table
  const columns = [
    { header: "Data", dataKey: "date" },
    { header: "Descrição", dataKey: "description" },
    { header: "Valor", dataKey: "value" },
    { header: "Tipo", dataKey: "type" },
    { header: "Situação", dataKey: "status" }
  ];
  
  // Create table (empty for now, in a real app this would use reportData.data)
  autoTable(doc, {
    startY: 70,
    head: [columns.map(column => column.header)],
    body: reportData.data.length > 0 ? 
      reportData.data.map(row => columns.map(column => row[column.dataKey] || "")) :
      [["Não há dados para exibir no período selecionado.", "", "", "", ""]],
    headStyles: {
      fillColor: [1, 35, 64], // #012340
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { top: 70 }
  });
  
  // Save the PDF
  doc.save("conciliacao_bancaria.pdf");
};

// New function for generating planning reports
export const generatePlanningPDF = (planning: Planning) => {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("ATA DE REGISTRO DE PREÇO", 14, 22);
  
  // Add ATA number
  doc.setFontSize(14);
  doc.text(`${planning.ataNumber || "RASCUNHO"}`, 14, 30);
  
  // Add metadata
  doc.setFontSize(11);
  const finalizedDate = planning.finalizedAt 
    ? new Date(planning.finalizedAt).toLocaleDateString() 
    : "Não finalizado";
  
  doc.setFontSize(11);
  doc.text(`Status: ${planning.status === "finalized" ? "Finalizado" : "Rascunho"}`, 14, 42);
  doc.text(`Data de Finalização: ${finalizedDate}`, 14, 48);
  doc.text(`Responsável: ${planning.finalizedBy || "—"}`, 14, 54);
  
  // Define columns
  const columns = [
    { header: "Item", dataKey: "name" },
    { header: "Qtde.", dataKey: "quantity" },
    { header: "Unidade", dataKey: "unit" },
    { header: "Descrição", dataKey: "description" },
    { header: "Disponível", dataKey: "available" },
  ];
  
  // Format data
  const data = planning.items.map((item) => {
    return {
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      description: item.description || "—",
      available: (item.availableQuantity !== undefined 
        ? item.availableQuantity 
        : item.quantity).toString()
    };
  });
  
  // Create table
  autoTable(doc, {
    startY: 60,
    head: [columns.map(column => column.header)],
    body: data.map(row => columns.map(column => row[column.dataKey as keyof typeof row])),
    headStyles: {
      fillColor: [1, 35, 64], // #012340
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { top: 60 }
  });
  
  // Get footer y position
  const finalY = (doc as any).lastAutoTable.finalY || 60;
  
  // Add footer
  doc.setFontSize(10);
  doc.text(`Total de itens: ${planning.items.length}`, 14, finalY + 15);
  
  // Save the PDF - use ATA number or default name
  const filename = planning.ataNumber 
    ? `ATA_${planning.ataNumber.replace(/-/g, "_")}.pdf` 
    : "planejamento_rascunho.pdf";
    
  doc.save(filename);
};
