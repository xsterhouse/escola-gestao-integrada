
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateATAReport = (data: any[], format: 'pdf' | 'excel') => {
  if (format === 'pdf') {
    generatePDFReport(data);
  } else {
    generateExcelReport(data);
  }
};

const generatePDFReport = (data: any[]) => {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(16);
  doc.text('Relatório de ATAs de Registro de Preços', 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Preparar dados para a tabela
  const tableData = data.flatMap(contract => 
    contract.items.map((item: any) => [
      contract.escola,
      contract.usuario,
      contract.fornecedor,
      contract.numeroProcesso,
      item.nome,
      item.unidade,
      item.quantidade.toString(),
      `R$ ${item.valorUnitario.toFixed(2)}`,
      `R$ ${item.valorTotal.toFixed(2)}`,
      new Date(contract.inicioVigencia).toLocaleDateString('pt-BR'),
      new Date(contract.fimVigencia).toLocaleDateString('pt-BR')
    ])
  );

  // Criar tabela
  (doc as any).autoTable({
    head: [[
      'Escola',
      'Usuário',
      'Fornecedor', 
      'Nº Processo',
      'Produto',
      'Unidade',
      'Quantidade',
      'Valor Unit.',
      'Valor Total',
      'Início Vigência',
      'Fim Vigência'
    ]],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] }
  });

  doc.save('relatorio-atas.pdf');
};

const generateExcelReport = (data: any[]) => {
  // Preparar dados para CSV (simplificado)
  const csvData = data.flatMap(contract => 
    contract.items.map((item: any) => ({
      Escola: contract.escola,
      Usuario: contract.usuario,
      Fornecedor: contract.fornecedor,
      NumeroProcesso: contract.numeroProcesso,
      Produto: item.nome,
      Unidade: item.unidade,
      Quantidade: item.quantidade,
      ValorUnitario: item.valorUnitario,
      ValorTotal: item.valorTotal,
      InicioVigencia: new Date(contract.inicioVigencia).toLocaleDateString('pt-BR'),
      FimVigencia: new Date(contract.fimVigencia).toLocaleDateString('pt-BR')
    }))
  );

  // Converter para CSV
  const headers = Object.keys(csvData[0] || {});
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => headers.map(header => (row as any)[header]).join(','))
  ].join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'relatorio-atas.csv';
  link.click();
};
