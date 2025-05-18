
import { useState, useCallback, useRef } from "react";
import mammoth from "mammoth";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { FileText, Plus, Filter, Download, Trash2, Eye, Import } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductsTable } from "@/components/products/ProductsTable";
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { ViewProductDialog } from "@/components/products/ViewProductDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { Product } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePDF } from "@/lib/pdf-utils";

export default function Products() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteMode, setDeleteMode] = useState<"single" | "multiple" | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Ref to the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save products to localStorage whenever they change
  const saveProducts = useCallback((newProducts: Product[]) => {
    localStorage.setItem("products", JSON.stringify(newProducts));
    setProducts(newProducts);
  }, []);

  // Filter products based on familyAgriculture
  const filteredProducts = products.filter(product => {
    if (filterValue === "all") return true;
    return filterValue === "yes" ? product.familyAgriculture : !product.familyAgriculture;
  });

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      // Check file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'docx') {
        // Process DOCX file
        await processDocxFile(file);
      } else {
        toast.error("Formato de arquivo não suportado. Por favor, envie um arquivo .docx");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Erro ao processar o arquivo. Verifique se o formato está correto.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Process DOCX file
  const processDocxFile = async (file: File) => {
    try {
      // Convert the file to arrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Use mammoth to extract HTML from the DOCX
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find the first table
      const table = doc.querySelector('table');
      if (!table) {
        toast.error("Nenhuma tabela encontrada no documento");
        return;
      }
      
      // Get table rows
      const rows = Array.from(table.querySelectorAll('tr'));
      
      // Get headers from the first row
      const headers = Array.from(rows[0].querySelectorAll('th, td')).map(cell => 
        cell.textContent?.trim().toLowerCase() || '');
      
      // Check if headers match expected format
      const requiredHeaders = ['item', 'descrição de produtos', 'unid', 'quant.'];
      const headersMatch = requiredHeaders.every(header => 
        headers.some(h => h.includes(header)));
      
      if (!headersMatch) {
        toast.error("Formato de tabela inválido. Certifique-se de que a tabela contém os cabeçalhos: Item, Descrição de produtos, Unid, Quant.");
        return;
      }
      
      // Get column indices
      const itemIndex = headers.findIndex(h => h.includes('item'));
      const descriptionIndex = headers.findIndex(h => h.includes('descrição'));
      const unitIndex = headers.findIndex(h => h.includes('unid'));
      const quantityIndex = headers.findIndex(h => h.includes('quant'));
      
      // Parse data rows (skip header row)
      const newProducts: Product[] = [];
      let validRows = 0;
      let invalidRows = 0;
      
      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll('td, th'));
        
        // Skip empty rows
        if (cells.length < 3) continue;
        
        const itemText = cells[itemIndex]?.textContent?.trim() || '';
        const item = parseInt(itemText);
        
        // Validate item (must be a number)
        if (isNaN(item)) {
          invalidRows++;
          continue;
        }
        
        const description = cells[descriptionIndex]?.textContent?.trim() || '';
        const unit = cells[unitIndex]?.textContent?.trim() || '';
        const quantity = cells[quantityIndex]?.textContent?.trim() || '';
        
        // Create new product
        newProducts.push({
          id: uuidv4(),
          item,
          description,
          unit,
          quantity,
          familyAgriculture: false, // Default value
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        validRows++;
      }
      
      if (newProducts.length === 0) {
        toast.error("Nenhum produto válido encontrado na tabela.");
        return;
      }
      
      // Update products array
      const updatedProducts = [...products, ...newProducts];
      saveProducts(updatedProducts);
      
      toast.success(`${validRows} produtos importados com sucesso${invalidRows > 0 ? `. ${invalidRows} linhas inválidas foram ignoradas.` : '.'}`);
    } catch (error) {
      console.error("Error processing DOCX file:", error);
      toast.error("Erro ao processar o arquivo DOCX.");
    }
  };

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  // Handle adding a new product
  const handleAddProduct = (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
    toast.success("Produto adicionado com sucesso!");
  };

  // Handle updating a product
  const handleUpdateProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map(product =>
      product.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date() } : product
    );
    saveProducts(updatedProducts);
    toast.success("Produto atualizado com sucesso!");
  };

  // Handle deleting products
  const handleDelete = () => {
    if (deleteMode === "single" && productToDelete) {
      const updatedProducts = products.filter(product => product.id !== productToDelete);
      saveProducts(updatedProducts);
      toast.success("Produto excluído com sucesso!");
    } else if (deleteMode === "multiple" && selectedProducts.length > 0) {
      const updatedProducts = products.filter(product => !selectedProducts.includes(product.id));
      saveProducts(updatedProducts);
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} produtos excluídos com sucesso!`);
    }
    
    setDeleteMode(null);
    setProductToDelete(null);
  };

  // Handle exporting to PDF
  const handleExportPDF = (allProducts: boolean = false) => {
    const productsToExport = allProducts ? products : filteredProducts;
    generatePDF(productsToExport);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Produtos</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Import className="mr-2 h-4 w-4" />
              Importar Produtos
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportPDF(false)}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportPDF(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Todos
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Importar Tabela de Produtos</CardTitle>
            <CardDescription>
              Importe produtos a partir de um arquivo .docx contendo uma tabela com os campos: Item, Descrição de produtos, Unid, Quant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
            >
              <input {...getInputProps()} ref={fileInputRef} />
              {loading ? (
                <p className="text-muted-foreground">Processando arquivo...</p>
              ) : isDragActive ? (
                <p className="text-primary">Solte o arquivo aqui...</p>
              ) : (
                <div>
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">
                    Arraste e solte um arquivo .docx aqui, ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    O arquivo deve conter uma tabela com as colunas: Item, Descrição de produtos, Unid e Quant.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>
                Gerencie seus produtos importados
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filterValue}
                  onValueChange={setFilterValue}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Agricultura Familiar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os produtos</SelectItem>
                    <SelectItem value="yes">Agricultura Familiar: Sim</SelectItem>
                    <SelectItem value="no">Agricultura Familiar: Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setDeleteMode("multiple")} disabled={selectedProducts.length === 0}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Itens
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Inserir Produto
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProductsTable
              products={filteredProducts}
              onUpdate={handleUpdateProduct}
              onView={setViewProduct}
              onDelete={(id) => {
                setProductToDelete(id);
                setDeleteMode("single");
              }}
              selectedProducts={selectedProducts}
              onSelectProducts={setSelectedProducts}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProduct}
      />
      
      <ViewProductDialog
        product={viewProduct}
        open={!!viewProduct}
        onOpenChange={(open) => {
          if (!open) setViewProduct(null);
        }}
      />
      
      <DeleteProductDialog
        mode={deleteMode}
        count={deleteMode === "multiple" ? selectedProducts.length : 1}
        open={deleteMode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteMode(null);
            setProductToDelete(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
}
