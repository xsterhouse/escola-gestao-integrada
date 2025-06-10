
import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { ProductSuggestion } from "@/components/planning/types";

export function useProductSearch(products: Product[], searchValue: string, isLoading: boolean) {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    console.log("🔤 EFEITO DE BUSCA EXECUTADO:");
    console.log("   - Valor digitado:", `"${searchValue}"`);
    console.log("   - Tamanho do valor:", searchValue.length);
    console.log("   - Produtos disponíveis:", products.length);
    console.log("   - Está carregando:", isLoading);
    
    if (isLoading) {
      console.log("⏳ Ainda carregando produtos, aguardando...");
      return;
    }
    
    if (searchValue.length < 2) {
      console.log("📏 Valor muito curto (< 2 caracteres), limpando sugestões");
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (products.length === 0) {
      console.log("📭 NENHUM produto disponível para buscar");
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    console.log("🔍 INICIANDO busca com valor:", `"${searchValue}"`);
    
    const searchTerm = searchValue.toLowerCase().trim();
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
        item: product.item?.toString()
      }));
    
    console.log("✨ RESULTADOS da busca:", filtered.length, "produtos encontrados");
    console.log("✨ PRODUTOS filtrados:", filtered);
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchValue, products, isLoading]);

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    setSuggestions
  };
}
