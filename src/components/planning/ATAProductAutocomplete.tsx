
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
  ({ value, onChange, onProductSelect, placeholder = "Digite para buscar produtos...", disabled = false }, ref) => {
    console.log("🚀 ATAProductAutocomplete RENDERIZADO - valor atual:", value);
    
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Carregar produtos uma única vez no mount
    useEffect(() => {
      console.log("🔄 INICIANDO carregamento de produtos...");
      setIsLoading(true);
      
      const loadProducts = (): Product[] => {
        try {
          console.log("📦 Verificando localStorage...");
          const storedProducts = localStorage.getItem("products");
          console.log("📋 Dados RAW do localStorage 'products':", storedProducts);
          
          if (!storedProducts) {
            console.log("❌ NENHUM dado encontrado no localStorage 'products'");
            return [];
          }
          
          const parsedData = JSON.parse(storedProducts);
          console.log("🔍 Dados PARSEADOS:", parsedData);
          console.log("🔍 Tipo dos dados:", typeof parsedData, "É array?", Array.isArray(parsedData));
          
          let productArray: Product[] = [];
          
          if (Array.isArray(parsedData)) {
            console.log("✅ Dados são um array direto com", parsedData.length, "itens");
            productArray = parsedData;
          } else if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
            console.log("✅ Dados estão em .data com", parsedData.data.length, "itens");
            productArray = parsedData.data;
          } else {
            console.log("❌ Estrutura de dados não reconhecida:", parsedData);
            return [];
          }
          
          console.log("📊 PRODUTOS CARREGADOS:", productArray.length);
          console.log("📊 EXEMPLO do primeiro produto:", productArray[0]);
          
          return productArray;
        } catch (error) {
          console.error("❌ ERRO ao carregar produtos:", error);
          return [];
        }
      };

      const loadedProducts = loadProducts();
      setProducts(loadedProducts);
      setIsLoading(false);
      console.log("✅ PRODUTOS definidos no estado:", loadedProducts.length, "produtos");
    }, []);

    // Filtrar produtos com base no texto digitado
    useEffect(() => {
      console.log("🔤 EFEITO DE BUSCA EXECUTADO:");
      console.log("   - Valor digitado:", `"${value}"`);
      console.log("   - Tamanho do valor:", value.length);
      console.log("   - Produtos disponíveis:", products.length);
      console.log("   - Está carregando:", isLoading);
      
      if (isLoading) {
        console.log("⏳ Ainda carregando produtos, aguardando...");
        return;
      }
      
      if (value.length < 2) {
        console.log("📏 Valor muito curto (< 2 caracteres), limpando sugestões");
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        return;
      }
      
      if (products.length === 0) {
        console.log("📭 NENHUM produto disponível para buscar");
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      
      console.log("🔍 INICIANDO busca com valor:", `"${value}"`);
      
      const searchTerm = value.toLowerCase().trim();
      console.log("🔍 Termo de busca processado:", `"${searchTerm}"`);
      
      const filtered = products
        .filter(product => {
          const hasDescription = product.description && 
            product.description.toLowerCase().includes(searchTerm);
          
          console.log(`   🔍 Produto "${product.description}" -> Match: ${hasDescription}`);
          return hasDescription;
        })
        .slice(0, 8)
        .map(product => ({
          id: product.id,
          description: product.description,
          unit: product.unit,
          item: product.item
        }));
      
      console.log("✨ RESULTADOS da busca:", filtered.length, "produtos encontrados");
      console.log("✨ PRODUTOS filtrados:", filtered);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    }, [value, products, isLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      console.log("📝 INPUT CHANGE:", `"${value}" -> "${newValue}"`);
      onChange(newValue);
    };

    const handleProductClick = (product: ProductSuggestion) => {
      console.log("🎯 PRODUTO SELECIONADO:", product);
      onChange(product.description);
      onProductSelect(product);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      console.log("⌨️ TECLA:", e.key, "| Sugestões visíveis:", showSuggestions, "| Quantidade:", suggestions.length);
      
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
      console.log("👋 INPUT perdeu foco");
      setTimeout(() => {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }, 200);
    };

    const handleFocus = () => {
      console.log("🎯 INPUT ganhou foco, valor atual:", `"${value}"`);
      if (value.length >= 2 && suggestions.length > 0) {
        console.log("🔄 Reexibindo sugestões existentes");
        setShowSuggestions(true);
      }
    };

    console.log("🖼️ RENDERIZANDO componente:");
    console.log("   - Exibir sugestões:", showSuggestions);
    console.log("   - Quantidade de sugestões:", suggestions.length);
    console.log("   - Carregando:", isLoading);

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
          className="w-full min-h-[60px] text-base leading-relaxed px-4 py-3"
        />
        
        {isLoading && (
          <div className="absolute z-50 w-full mt-1 p-3 bg-white border rounded-lg shadow-lg">
            <div className="text-sm text-gray-600 flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Carregando produtos do catálogo...
            </div>
          </div>
        )}
        
        {showSuggestions && suggestions.length > 0 && !isLoading && (
          <Card className="absolute z-50 w-full mt-1 max-h-72 overflow-y-auto shadow-xl border-2">
            <CardContent className="p-0">
              {suggestions.map((product, index) => (
                <div
                  key={product.id}
                  className={`p-4 cursor-pointer border-b last:border-b-0 hover:bg-blue-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="font-medium text-base text-gray-900 mb-1">
                    {product.description}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-3">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                      Unidade: {product.unit}
                    </span>
                    {product.item && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        Item: {product.item}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {showSuggestions && suggestions.length === 0 && value.length >= 2 && !isLoading && (
          <Card className="absolute z-50 w-full mt-1 shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 text-center">
                <div className="mb-2">Nenhum produto encontrado para "{value}"</div>
                <div className="text-xs text-gray-400">
                  Verifique a descrição ou continue digitando para refinar a busca
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);

ATAProductAutocomplete.displayName = "ATAProductAutocomplete";
