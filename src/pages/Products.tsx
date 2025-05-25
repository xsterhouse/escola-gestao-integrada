
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { ViewProductDialog } from "@/components/products/ViewProductDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { ImportProductsCard } from "@/components/products/ImportProductsCard";
import { ProductsListCard } from "@/components/products/ProductsListCard";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { Product } from "@/lib/types";
import { generateImprovedProductPDF } from "@/lib/improved-pdf-utils";

export default function Products() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [filterValue, setFilterValue] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteMode, setDeleteMode] = useState<"single" | "multiple" | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Save products to localStorage whenever they change
  const saveProducts = useCallback((newProducts: Product[]) => {
    localStorage.setItem("products", JSON.stringify(newProducts));
    setProducts(newProducts);
  }, []);

  // Filter products based on familyAgriculture
  const filteredProducts = products.filter(product => {
    if (filterValue === "all") return true;
    return filterValue === "yes" ? product.familyAgriculture : !product.familyAgriculture;
  });

  // Calculate next item number based on existing products
  const getNextItemNumber = () => {
    if (products.length === 0) return 1;
    return Math.max(...products.map(product => product.item)) + 1;
  };

  // Handle adding a new product
  const handleAddProduct = (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
    toast.success("Produto adicionado com sucesso!");
  };

  // Handle updating a product
  const handleUpdateProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map(product =>
      product.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date() } : product
    );
    saveProducts(updatedProducts);
    toast.success("Produto atualizado com sucesso!");
  };

  // Handle importing products
  const handleImportProducts = (newProducts: Product[]) => {
    const updatedProducts = [...products, ...newProducts];
    saveProducts(updatedProducts);
  };

  // Handle deleting products
  const handleDelete = () => {
    if (deleteMode === "single" && productToDelete) {
      const updatedProducts = products.filter(product => product.id !== productToDelete);
      saveProducts(updatedProducts);
      toast.success("Produto excluído com sucesso!");
    } else if (deleteMode === "multiple" && selectedProducts.length > 0) {
      const updatedProducts = products.filter(product => !selectedProducts.includes(product.id));
      saveProducts(updatedProducts);
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} produtos excluídos com sucesso!`);
    }
    
    setDeleteMode(null);
    setProductToDelete(null);
  };

  // Handle exporting to PDF with improved layout
  const handleExportPDF = (allProducts: boolean = false) => {
    const productsToExport = allProducts ? products : filteredProducts;
    const title = allProducts ? "Relatório de Todos os Produtos" : "Relatório de Produtos Filtrados";
    generateImprovedProductPDF(productsToExport, title);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <ProductsHeader 
          onImport={() => setIsAddDialogOpen(true)}
          onExportCurrent={() => handleExportPDF(false)}
          onExportAll={() => handleExportPDF(true)}
          currentProducts={filteredProducts}
          allProducts={products}
        />

        <ImportProductsCard 
          onProductsImported={handleImportProducts}
          existingProducts={products}
        />

        <ProductsListCard 
          products={filteredProducts}
          selectedProducts={selectedProducts}
          filterValue={filterValue}
          onUpdateProduct={handleUpdateProduct}
          onViewProduct={setViewProduct}
          onDeleteProduct={(id) => {
            setProductToDelete(id);
            setDeleteMode("single");
          }}
          onSelectProducts={setSelectedProducts}
          onFilterChange={setFilterValue}
          onAddProduct={() => setIsAddDialogOpen(true)}
          onDeleteMultiple={() => setDeleteMode("multiple")}
        />
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProduct}
        existingProducts={products}
      />
      
      <ViewProductDialog
        product={viewProduct}
        open={!!viewProduct}
        onOpenChange={(open) => {
          if (!open) setViewProduct(null);
        }}
      />
      
      <DeleteProductDialog
        mode={deleteMode}
        count={deleteMode === "multiple" ? selectedProducts.length : 1}
        open={deleteMode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteMode(null);
            setProductToDelete(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
}
