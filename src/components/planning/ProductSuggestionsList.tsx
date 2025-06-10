import { Card, CardContent } from "@/components/ui/card";
import { ProductSuggestion } from "./types";

interface ProductSuggestionsListProps {
  suggestions: ProductSuggestion[];
  selectedIndex: number;
  onProductClick: (product: ProductSuggestion) => void;
  searchValue: string;
  isLoading: boolean;
  showSuggestions: boolean;
}

export function ProductSuggestionsList({
  suggestions,
  selectedIndex,
  onProductClick,
  searchValue,
  isLoading,
  showSuggestions
}: ProductSuggestionsListProps) {
  if (isLoading) {
    return (
      <div className="absolute z-50 w-full mt-1 p-3 bg-white border rounded-lg shadow-lg">
        <div className="text-sm text-gray-600 flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
          Carregando produtos do catálogo...
        </div>
      </div>
    );
  }

  if (!showSuggestions) {
    return null;
  }

  if (suggestions.length === 0 && searchValue.length >= 2) {
    return (
      <Card className="absolute z-50 w-full mt-1 shadow-lg">
        <CardContent className="p-4">
          <div className="text-sm text-gray-500 text-center">
            <div className="mb-2">Nenhum produto encontrado para "{searchValue}"</div>
            <div className="text-xs text-gray-400">
              Verifique a descrição ou continue digitando para refinar a busca
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length > 0) {
    return (
      <Card className="absolute z-50 w-full mt-1 max-h-72 overflow-y-auto shadow-xl border-2">
        <CardContent className="p-0">
          {suggestions.map((product, index) => (
            <div
              key={product.id}
              className={`p-4 cursor-pointer border-b last:border-b-0 hover:bg-blue-50 transition-colors ${
                index === selectedIndex ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => onProductClick(product)}
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
    );
  }

  return null;
}
