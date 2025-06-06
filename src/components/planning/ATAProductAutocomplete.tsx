
import { useState, useEffect, useRef, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";

interface ProductSuggestion {
  id: string;
  description: string;
  unit: string;
  item?: number;
}

interface ATAProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: ProductSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ATAProductAutocomplete = forwardRef<HTMLInputElement, ATAProductAutocompleteProps>(
  ({ value, onChange, onProductSelect, placeholder = "Digite o nome do produto...", disabled = false }, ref) => {
    console.log("🚀 ATAProductAutocomplete renderizado com valor:", value);
    
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [products, setProducts] = useState<Product[]>([]);
    
    // Carregar produtos uma única vez no mount
    useEffect(() => {
      console.log("📥 Carregando produtos do localStorage...");
      const loadProducts = (): Product[] => {
        try {
          const storedProducts = localStorage.getItem("products");
          console.log("🔍 Dados brutos do localStorage 'products':", storedProducts);
          
          if (storedProducts) {
            const parsedData = JSON.parse(storedProducts);
            console.log("📋 Dados parseados:", parsedData);
            
            // Se for um array direto de produtos
            if (Array.isArray(parsedData)) {
              console.log("✅ Array de produtos encontrado:", parsedData.length, "produtos");
              return parsedData;
            }
            
            // Se for um objeto com propriedade 'data'
            if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
              console.log("✅ Dados em parsedData.data encontrados:", parsedData.data.length, "produtos");
              return parsedData.data;
            }
          }
          
          console.log("❌ Nenhum produto encontrado no localStorage");
          return [];
        } catch (error) {
          console.error("❌ Erro ao carregar produtos:", error);
          return [];
        }
      };

      const loadedProducts = loadProducts();
      setProducts(loadedProducts);
      console.log("💾 Produtos carregados no estado:", loadedProducts.length);
    }, []);

    // Filtrar produtos com base no texto digitado
    useEffect(() => {
      console.log("🔤 Texto digitado mudou:", value, "| Tamanho:", value.length, "| Produtos disponíveis:", products.length);
      
      if (value.length >= 3 && products.length > 0) {
        console.log("🔍 Iniciando filtro de produtos...");
        
        const filtered = products
          .filter(product => {
            const hasDescription = product.description && 
              product.description.toLowerCase().includes(value.toLowerCase());
            console.log(`🔍 Produto "${product.description}" - Match:`, hasDescription);
            return hasDescription;
          })
          .slice(0, 10)
          .map(product => ({
            id: product.id,
            description: product.description,
            unit: product.unit,
            item: product.item
          }));
        
        console.log("✨ Produtos filtrados:", filtered);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(-1);
      } else {
        if (value.length < 3) {
          console.log("⏳ Aguardando pelo menos 3 caracteres...");
        }
        if (products.length === 0) {
          console.log("📭 Nenhum produto disponível para filtrar");
        }
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, [value, products]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      console.log("📝 Input mudou de:", value, "para:", newValue);
      onChange(newValue);
    };

    const handleProductClick = (product: ProductSuggestion) => {
      console.log("🎯 Produto selecionado:", product);
      onChange(product.description);
      onProductSelect(product);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      console.log("⌨️ Tecla pressionada:", e.key, "| Sugestões visíveis:", showSuggestions);
      
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleProductClick(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    const handleBlur = () => {
      console.log("👋 Input perdeu o foco");
      // Delay para permitir clique nas sugestões
      setTimeout(() => {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }, 200);
    };

    const handleFocus = () => {
      console.log("🎯 Input ganhou foco com valor:", value);
      if (value.length >= 3 && suggestions.length > 0) {
        console.log("🔄 Reexibindo sugestões...");
        setShowSuggestions(true);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
            <CardContent className="p-0">
              {suggestions.map((product, index) => (
                <div
                  key={product.id}
                  className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="font-medium text-sm">{product.description}</div>
                  <div className="text-xs text-gray-500">
                    Unidade: {product.unit}
                    {product.item && ` | Item: ${product.item}`}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {showSuggestions && suggestions.length === 0 && value.length >= 3 && (
          <Card className="absolute z-50 w-full mt-1">
            <CardContent className="p-3">
              <div className="text-sm text-gray-500">
                Nenhum produto encontrado para "{value}". Continue digitando ou verifique a descrição.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);

ATAProductAutocomplete.displayName = "ATAProductAutocomplete";
