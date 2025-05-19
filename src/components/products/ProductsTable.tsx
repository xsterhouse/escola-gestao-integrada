
import { useState } from "react";
import { Eye, Pencil, Save, Trash2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ProductsTableProps {
  products: Product[];
  onUpdate: (product: Product) => void;
  onView: (product: Product) => void;
  onDelete: (id: string) => void;
  selectedProducts: string[];
  onSelectProducts: (ids: string[]) => void;
}

export function ProductsTable({
  products,
  onUpdate,
  onView,
  onDelete,
  selectedProducts,
  onSelectProducts,
}: ProductsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 15;

  // Start editing a product
  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditingProduct({ ...product });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingProduct(null);
  };

  // Save edited product
  const saveProduct = () => {
    if (editingProduct) {
      onUpdate(editingProduct);
      setEditingId(null);
      setEditingProduct(null);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectProducts(paginatedProducts.map(product => product.id));
    } else {
      onSelectProducts([]);
    }
  };

  // Handle individual checkbox
  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      onSelectProducts([...selectedProducts, id]);
    } else {
      onSelectProducts(selectedProducts.filter(productId => productId !== id));
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          isActive={currentPage === 1} 
          onClick={() => goToPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // If there are many pages, use ellipsis
    if (totalPages > 7) {
      if (currentPage > 3) {
        items.push(<PaginationItem key="ellipsis-1">...</PaginationItem>);
      }

      // Show current page and neighbors
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={`page-${i}`}>
            <PaginationLink 
              isActive={currentPage === i} 
              onClick={() => goToPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationItem key="ellipsis-2">...</PaginationItem>);
      }
    } else {
      // If few pages, show all
      for (let i = 2; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={`page-${i}`}>
            <PaginationLink 
              isActive={currentPage === i} 
              onClick={() => goToPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={paginatedProducts.length > 0 && selectedProducts.length >= paginatedProducts.length} 
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead className="w-[80px]">ITEM</TableHead>
              <TableHead>DESCRIÇÃO DO PRODUTO</TableHead>
              <TableHead className="w-[100px]">UNID</TableHead>
              <TableHead className="w-[100px]">QUANT.</TableHead>
              <TableHead className="w-[160px]">Agricultura Familiar</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado. Importe produtos ou adicione manualmente.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedProducts.includes(product.id)} 
                      onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <Input 
                        type="number" 
                        value={editingProduct?.item || ""} 
                        onChange={(e) => setEditingProduct(prev => 
                          prev ? { ...prev, item: parseInt(e.target.value) } : null
                        )}
                        className="w-16"
                      />
                    ) : (
                      product.item
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <Input 
                        value={editingProduct?.description || ""} 
                        onChange={(e) => setEditingProduct(prev => 
                          prev ? { ...prev, description: e.target.value } : null
                        )}
                      />
                    ) : (
                      <div className="truncate max-w-md" title={product.description}>
                        {product.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <Input 
                        value={editingProduct?.unit || ""} 
                        onChange={(e) => setEditingProduct(prev => 
                          prev ? { ...prev, unit: e.target.value } : null
                        )}
                        className="w-20"
                      />
                    ) : (
                      product.unit
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <Input 
                        value={editingProduct?.quantity || ""} 
                        onChange={(e) => setEditingProduct(prev => 
                          prev ? { ...prev, quantity: e.target.value } : null
                        )}
                        className="w-20"
                      />
                    ) : (
                      product.quantity || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <Select
                        value={editingProduct?.familyAgriculture ? "yes" : "no"}
                        onValueChange={(value) => setEditingProduct(prev => 
                          prev ? { ...prev, familyAgriculture: value === "yes" } : null
                        )}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Sim</SelectItem>
                          <SelectItem value="no">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      product.familyAgriculture ? "Sim" : "Não"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {editingId === product.id ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={saveProduct} title="Salvar">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={cancelEditing} title="Cancelar">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => onView(product)} title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => startEditing(product)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} title="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Product Editing Modal for Indication and Restriction */}
      {editingId && editingProduct && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={cancelEditing}>
          <div className="bg-white p-4 rounded-md shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">Campos Adicionais</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Indicação (máx. 50 caracteres)</label>
                <Textarea
                  value={editingProduct.indication || ""}
                  onChange={(e) => setEditingProduct(prev => 
                    prev ? { ...prev, indication: e.target.value } : null
                  )}
                  maxLength={50}
                  className="w-full"
                  placeholder="Informe a indicação do produto"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Restrição (máx. 50 caracteres)</label>
                <Textarea
                  value={editingProduct.restriction || ""}
                  onChange={(e) => setEditingProduct(prev => 
                    prev ? { ...prev, restriction: e.target.value } : null
                  )}
                  maxLength={50}
                  className="w-full"
                  placeholder="Informe a restrição do produto"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={cancelEditing}>Cancelar</Button>
                <Button onClick={saveProduct}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {renderPaginationItems()}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
