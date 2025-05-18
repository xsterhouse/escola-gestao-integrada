
import { Plus, Filter, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductsTable } from "./ProductsTable";
import { Product } from "@/lib/types";

interface ProductsListCardProps {
  products: Product[];
  selectedProducts: string[];
  filterValue: string;
  onUpdateProduct: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSelectProducts: (ids: string[]) => void;
  onFilterChange: (value: string) => void;
  onAddProduct: () => void;
  onDeleteMultiple: () => void;
}

export function ProductsListCard({
  products,
  selectedProducts,
  filterValue,
  onUpdateProduct,
  onViewProduct,
  onDeleteProduct,
  onSelectProducts,
  onFilterChange,
  onAddProduct,
  onDeleteMultiple
}: ProductsListCardProps) {
  return (
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
              onValueChange={onFilterChange}
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
            <Button variant="outline" onClick={onDeleteMultiple} disabled={selectedProducts.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Itens
            </Button>
            <Button onClick={onAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Inserir Produto
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ProductsTable
          products={products}
          onUpdate={onUpdateProduct}
          onView={onViewProduct}
          onDelete={onDeleteProduct}
          selectedProducts={selectedProducts}
          onSelectProducts={onSelectProducts}
        />
      </CardContent>
    </Card>
  );
}
