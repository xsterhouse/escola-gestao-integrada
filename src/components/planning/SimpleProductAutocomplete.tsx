
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSuggestion } from "./types";

interface SimpleProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: ProductSuggestion) => void;
  availableProducts?: ProductSuggestion[];
  placeholder?: string;
  disabled?: boolean;
}

export function SimpleProductAutocomplete({
  value,
  onChange,
  onProductSelect,
  availableProducts = [],
  placeholder = "Digite para buscar produtos...",
  disabled = false,
}: SimpleProductAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  console.log("🔍 SimpleProductAutocomplete - produtos disponíveis:", availableProducts.length);

  // Filtrar produtos com base no texto digitado
  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchTerm = value.toLowerCase().trim();
      
      const filtered = availableProducts
        .filter(product => 
          product.description?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 8);
      
      console.log("🔍 Produtos filtrados:", filtered.length);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, availableProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleProductSelect = (product: ProductSuggestion) => {
    console.log("✅ Produto selecionado:", product);
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
        if (selectedIndex >= 0) {
          handleProductSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <Input
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
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {suggestions.map((product, index) => (
              <div
                key={`${product.description}-${product.unit}`}
                className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted/50 ${
                  index === selectedIndex ? 'bg-muted' : ''
                }`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="font-medium text-sm">{product.description}</div>
                <div className="text-xs text-muted-foreground">
                  Unidade: {product.unit}
                  {product.availableStock !== undefined && (
                    <span className="ml-2 text-green-600">
                      Estoque: {product.availableStock}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {showSuggestions && suggestions.length === 0 && value.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">
              Nenhum produto encontrado no estoque para "{value}".
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
