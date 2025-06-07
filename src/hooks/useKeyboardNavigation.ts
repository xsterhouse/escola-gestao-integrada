
import { useState } from "react";

interface ProductSuggestion {
  id: string;
  description: string;
  unit: string;
  item?: number;
}

export function useKeyboardNavigation(
  suggestions: ProductSuggestion[],
  showSuggestions: boolean,
  onProductSelect: (product: ProductSuggestion) => void,
  onHideSuggestions: () => void
) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

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
          onProductSelect(suggestions[selectedIndex]);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        onHideSuggestions();
        setSelectedIndex(-1);
        break;
    }
  };

  const resetSelection = () => setSelectedIndex(-1);

  return {
    selectedIndex,
    handleKeyDown,
    resetSelection
  };
}
