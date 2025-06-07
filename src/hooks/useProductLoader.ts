
import { useState, useEffect } from "react";
import { Product } from "@/lib/types";

export function useProductLoader() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return { products, isLoading };
}
