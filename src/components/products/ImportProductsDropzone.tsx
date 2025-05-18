
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import mammoth from "mammoth";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress"; 
import { Product } from "@/lib/types";

interface ImportProductsDropzoneProps {
  onProductsImported: (newProducts: Product[]) => void;
  existingProducts: Product[];
}

export function ImportProductsDropzone({
  onProductsImported,
  existingProducts
}: ImportProductsDropzoneProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Process DOCX file
  const processDocxFile = async (file: File) => {
    try {
      setLoading(true);
      setProgress(10);
      
      // Convert the file to arrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);
      
      // Use mammoth to extract HTML from the DOCX
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      setProgress(60);
      
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find the first table
      const table = doc.querySelector('table');
      if (!table) {
        toast.error("Nenhuma tabela encontrada no documento");
        console.error("No table found in document");
        return;
      }
      
      // Get table rows
      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length < 2) {
        toast.error("A tabela não contém dados suficientes");
        console.error("Table doesn't have enough rows");
        return;
      }
      
      setProgress(70);
      
      // Get headers from the first row
      const headers = Array.from(rows[0].querySelectorAll('th, td')).map(cell => 
        cell.textContent?.trim().toLowerCase() || '');
      
      console.log("Headers encontrados:", headers);
      
      // Define os possíveis cabeçalhos para cada coluna (permite variações)
      const itemHeaders = ['item', 'número', 'num', 'nº', 'n°', 'número do item'];
      const descHeaders = ['descrição', 'descrição do produto', 'descrição de produtos', 'descrição dos produtos', 'produto', 'produtos'];
      const unitHeaders = ['unid', 'unidade', 'un', 'und', 'medida', 'un. medida', 'unidade de medida'];
      const quantHeaders = ['quantidade', 'quant', 'quant.', 'qtde', 'qtd', 'qtd.', 'qtde.'];
      
      // Find the indices of the required headers
      const itemIndex = headers.findIndex(h => itemHeaders.some(keyword => h.includes(keyword)));
      const descriptionIndex = headers.findIndex(h => descHeaders.some(keyword => h.includes(keyword)));
      const unitIndex = headers.findIndex(h => unitHeaders.some(keyword => h.includes(keyword)));
      const quantityIndex = headers.findIndex(h => quantHeaders.some(keyword => h.includes(keyword)));
      
      // Log header indices for debugging
      console.log("Índices dos cabeçalhos:", {
        itemIndex,
        descriptionIndex,
        unitIndex,
        quantityIndex
      });
      
      // Verificar se todos os cabeçalhos necessários foram encontrados
      const missingHeaders = [];
      if (itemIndex === -1) missingHeaders.push("ITEM");
      if (descriptionIndex === -1) missingHeaders.push("DESCRIÇÃO DO PRODUTO");
      if (unitIndex === -1) missingHeaders.push("UNID");
      if (quantityIndex === -1) missingHeaders.push("QUANT");
      
      if (missingHeaders.length > 0) {
        toast.error(`Formato de tabela inválido. Cabeçalhos não encontrados: ${missingHeaders.join(", ")}`);
        console.error("Missing headers:", missingHeaders);
        return;
      }
      
      setProgress(80);
      
      // Parse data rows (skip header row)
      const newProducts: Product[] = [];
      let validRows = 0;
      let invalidRows = 0;
      
      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll('td, th'));
        
        // Skip empty rows
        if (cells.length < 3) {
          console.log(`Row ${i} skipped: not enough cells`);
          continue;
        }
        
        // Obter os valores das células
        const itemText = cells[itemIndex]?.textContent?.trim() || '';
        const item = parseInt(itemText);
        
        // Validate item (must be a number)
        if (isNaN(item)) {
          console.log(`Row ${i} invalid: item is not a number`);
          invalidRows++;
          continue;
        }
        
        const description = cells[descriptionIndex]?.textContent?.trim() || '';
        const unit = cells[unitIndex]?.textContent?.trim() || '';
        const quantity = cells[quantityIndex]?.textContent?.trim() || '';
        
        // Validar dados obrigatórios
        if (!description || !unit) {
          console.log(`Row ${i} invalid: missing description or unit`);
          invalidRows++;
          continue;
        }
        
        console.log(`Row ${i} valid: ${item}, ${description}, ${unit}, ${quantity}`);
        
        // Create new product
        newProducts.push({
          id: uuidv4(),
          item,
          description,
          unit,
          quantity,
          familyAgriculture: false, // Default value, will be set manually
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        validRows++;
      }
      
      setProgress(90);
      
      if (newProducts.length === 0) {
        toast.error("Nenhum produto válido encontrado na tabela.");
        console.error("No valid products found");
        return;
      }
      
      // Update products array
      onProductsImported(newProducts);
      
      setProgress(100);
      toast.success(`${validRows} produtos importados com sucesso${invalidRows > 0 ? `. ${invalidRows} linhas inválidas foram ignoradas.` : '.'}`);
    } catch (error) {
      console.error("Error processing DOCX file:", error);
      toast.error("Erro ao processar o arquivo DOCX.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name);
    
    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'docx') {
      // Process DOCX file
      await processDocxFile(file);
    } else {
      toast.error("Formato de arquivo não suportado. Por favor, envie um arquivo .docx");
      console.error("Unsupported file format:", fileExtension);
    }
  }, [existingProducts, onProductsImported]);

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div>
            <p className="text-muted-foreground mb-2">Processando arquivo...</p>
            <Progress value={progress} className="h-2 w-full" />
          </div>
        ) : isDragActive ? (
          <p className="text-primary">Solte o arquivo aqui...</p>
        ) : (
          <div>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium">
              Arraste e solte um arquivo .docx aqui, ou clique para selecionar
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              O arquivo deve conter uma tabela com as colunas: ITEM, DESCRIÇÃO DO PRODUTO, UNID e QUANT.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
