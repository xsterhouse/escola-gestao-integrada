
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
      onSelectProducts(products.map(product => product.id));
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={products.length > 0 && selectedProducts.length === products.length} 
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
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum produto encontrado. Importe produtos ou adicione manualmente.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
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
  );
}
