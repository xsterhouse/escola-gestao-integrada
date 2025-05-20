import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Product, Invoice, InventoryReport, PurchaseReport, InventoryMovement } from "./types";

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

// Function to generate a planning report PDF
export const generatePlanningReportPDF = (reportData: {
  ataNumber: string;
  schoolName: string;
  userName: string;
  date: Date;
  items: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    description: string;
  }[];
}) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("ATA DE REGISTRO DE PREÇO", 14, 22);
  
  // Add report information
  doc.setFontSize(12);
  doc.text(`Número da ATA: ${reportData.ataNumber}`, 14, 35);
  doc.text(`Escola: ${reportData.schoolName}`, 14, 45);
  doc.text(`Responsável: ${reportData.userName}`, 14, 55);
  doc.text(`Data: ${reportData.date.toLocaleDateString()}`, 14, 65);
  
  // Define columns
  const columns = [
    { header: "Nome do Item", dataKey: "name" },
    { header: "Quantidade", dataKey: "quantity" },
    { header: "Unidade", dataKey: "unit" },
    { header: "Descrição", dataKey: "description" }
  ];
  
  // Format data
  const data = reportData.items.map((item) => ({
    name: item.name,
    quantity: item.quantity.toString(),
    unit: item.unit,
    description: item.description || "-"
  }));
  
  // Create table
  autoTable(doc, {
    startY: 75,
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
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 50 }, // Nome do Item
      1: { cellWidth: 25 }, // Quantidade
      2: { cellWidth: 25 }, // Unidade
      3: { cellWidth: "auto" } // Descrição (flexible)
    },
    margin: { top: 75 }
  });
  
  // Get footer y position
  const finalY = (doc as any).lastAutoTable.finalY || 75;
  
  // Add footer
  doc.setFontSize(10);
  doc.text(`Total de itens: ${reportData.items.length}`, 14, finalY + 15);
  
  // Format filename: ATA_Escola_Nome_YYYY-MM-DD.pdf
  const schoolNameFormatted = reportData.schoolName.replace(/\s+/g, '_');
  const dateFormatted = reportData.date.toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `ATA_${schoolNameFormatted}_${dateFormatted}.pdf`;
  
  // Save the PDF
  doc.save(filename);
};
