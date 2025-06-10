
import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useProductLoader } from "@/hooks/useProductLoader";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { ProductSuggestionsList } from "./ProductSuggestionsList";
import { ProductSearchModal } from "./ProductSearchModal";
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
    
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const { products, isLoading } = useProductLoader();
    const { suggestions, showSuggestions, setShowSuggestions } = useProductSearch(products, value, isLoading);
    
    const handleProductClick = (product: ProductSuggestion) => {
      console.log("🎯 PRODUTO SELECIONADO:", product);
      onChange(product.description);
      onProductSelect(product);
      setShowSuggestions(false);
      resetSelection();
    };

    const handleProductSelectFromModal = (product: Product) => {
      console.log("🎯 PRODUTO SELECIONADO DO MODAL:", product);
      const productSuggestion: ProductSuggestion = {
        id: product.id,
        description: product.description,
        unit: product.unit,
        item: product.item
      };
      onChange(product.description);
      onProductSelect(productSuggestion);
      setIsSearchModalOpen(false);
    };

    const handleHideSuggestions = () => {
      setShowSuggestions(false);
      resetSelection();
    };

    const { selectedIndex, handleKeyDown, resetSelection } = useKeyboardNavigation(
      suggestions,
      showSuggestions,
      handleProductClick,
      handleHideSuggestions
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      console.log("📝 INPUT CHANGE:", `"${value}" -> "${newValue}"`);
      onChange(newValue);
    };

    const handleBlur = () => {
      console.log("👋 INPUT perdeu foco");
      setTimeout(() => {
        setShowSuggestions(false);
        resetSelection();
      }, 200);
    };

    const handleFocus = () => {
      console.log("🎯 INPUT ganhou foco, valor atual:", `"${value}"`);
      if (value && value.length >= 2 && suggestions.length > 0) {
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
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={ref}
              value={value || ""}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full min-h-[60px] text-base leading-relaxed px-4 py-3"
            />
            
            <ProductSuggestionsList
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              onProductClick={handleProductClick}
              searchValue={value || ""}
              isLoading={isLoading}
              showSuggestions={showSuggestions}
            />
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSearchModalOpen(true)}
            disabled={disabled}
            className="min-h-[60px] px-4"
            title="Buscar no catálogo de produtos"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <ProductSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onProductSelect={handleProductSelectFromModal}
        />
      </div>
    );
  }
);

ATAProductAutocomplete.displayName = "ATAProductAutocomplete";
