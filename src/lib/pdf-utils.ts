
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Product } from "./types";

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
    { header: "Agric. Familiar", dataKey: "familyAgriculture" }
  ];
  
  // Format data
  const data = products.map((product) => ({
    item: product.item.toString(),
    description: product.description,
    unit: product.unit,
    quantity: product.quantity || "-",
    familyAgriculture: product.familyAgriculture ? "Sim" : "Não"
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
      fontSize: 10,
      cellPadding: 6
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 }
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
