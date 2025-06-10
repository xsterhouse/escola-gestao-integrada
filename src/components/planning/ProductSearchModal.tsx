
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Check } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect: (product: Product) => void;
}

export function ProductSearchModal({ isOpen, onClose, onProductSelect }: ProductSearchModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.item && product.item.toString().includes(searchTerm))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const loadProducts = () => {
    try {
      console.log("🔍 Carregando produtos para busca...");
      setIsLoading(true);
      
      const storedProducts = localStorage.getItem("products");
      if (!storedProducts) {
        console.log("❌ Nenhum produto encontrado no localStorage");
        setProducts([]);
        setFilteredProducts([]);
        setIsLoading(false);
        return;
      }

      const parsedData = JSON.parse(storedProducts);
      let productArray: Product[] = [];

      if (Array.isArray(parsedData)) {
        productArray = parsedData;
      } else if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        productArray = parsedData.data;
      }

      console.log("✅ Produtos carregados:", productArray.length);
      setProducts(productArray);
      setFilteredProducts(productArray);
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Erro ao carregar produtos:", error);
      setProducts([]);
      setFilteredProducts([]);
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    console.log("🎯 Produto selecionado:", product);
    onProductSelect(product);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Produto do Catálogo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Digite para buscar produtos por descrição ou número do item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                Carregando produtos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                {searchTerm ? `Nenhum produto encontrado para "${searchTerm}"` : "Nenhum produto cadastrado"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="w-20">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {product.item ? (
                          <Badge variant="outline">{product.item}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.unit}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleProductSelect(product)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="text-sm text-gray-500 text-center">
            {!isLoading && filteredProducts.length > 0 && (
              <span>
                {searchTerm 
                  ? `${filteredProducts.length} produto(s) encontrado(s)` 
                  : `${products.length} produto(s) no catálogo`
                }
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
