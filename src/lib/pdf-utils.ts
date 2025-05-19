
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Product, Invoice, InventoryReport, PurchaseReport } from "./types";

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

// New function for exporting inventory data
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
