
import { useState, useEffect, useRef } from "react";
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

export function ATAProductAutocomplete({
  value,
  onChange,
  onProductSelect,
  placeholder = "Digite o nome do produto...",
  disabled = false
}: ATAProductAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar produtos do localStorage
  const loadProducts = (): Product[] => {
    try {
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) {
        const parsedData = JSON.parse(storedProducts);
        
        // Se for um array de objetos com propriedade 'data', extrair os dados
        if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].data) {
          return parsedData.map(item => item.data);
        }
        
        // Se for um array direto, retornar como está
        if (Array.isArray(parsedData)) {
          return parsedData;
        }
      }
      return [];
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      return [];
    }
  };

  // Buscar produtos com base no texto digitado
  useEffect(() => {
    if (value.length >= 3) {
      const products = loadProducts();
      const filtered = products
        .filter(product => 
          product.description?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 10) // Limitar a 10 sugestões
        .map(product => ({
          id: product.id,
          description: product.description,
          unit: product.unit,
          item: product.item
        }));
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleProductClick = (product: ProductSuggestion) => {
    onChange(product.description);
    onProductSelect(product);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => value.length >= 3 && setSuggestions(suggestions)}
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
              Nenhum produto encontrado. Continue digitando para criar um novo produto.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
