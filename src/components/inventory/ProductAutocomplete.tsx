
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InvoiceItem } from "@/lib/types";

interface ProductAutocompleteProps {
  invoices: any[];
  value?: string;
  onProductSelect: (product: {
    description: string;
    unitOfMeasure: string;
    unitPrice: number;
  }) => void;
  placeholder?: string;
}

export function ProductAutocomplete({ 
  invoices, 
  value, 
  onProductSelect, 
  placeholder = "Selecione um produto..." 
}: ProductAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(value || "");
  
  // Update selectedValue when value prop changes
  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);
  
  // Extract unique products from all approved invoices
  const allProducts = invoices
    .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
    .flatMap(invoice => 
      invoice.items.map((item: InvoiceItem) => ({
        description: item.description,
        unitOfMeasure: item.unitOfMeasure,
        unitPrice: item.unitPrice,
        key: `${item.description}-${item.unitOfMeasure}` // Create unique key
      }))
    );
  
  // Remove duplicates based on description and unit
  const uniqueProducts = allProducts.filter((product, index, self) =>
    index === self.findIndex(p => p.key === product.key)
  );
  
  const filteredProducts = uniqueProducts.filter(product =>
    product.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (product: typeof uniqueProducts[0]) => {
    console.log("🎯 Produto selecionado no autocomplete:", product);
    
    setSelectedValue(product.description);
    
    onProductSelect({
      description: product.description,
      unitOfMeasure: product.unitOfMeasure,
      unitPrice: product.unitPrice
    });
    
    setSearchValue(""); // Limpar busca após seleção
    setOpen(false);
    
    console.log("✅ Produto selecionado e popover fechado:", product.description);
  };

  // Reset search when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    console.log("🔄 Mudando estado do popover:", newOpen);
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" style={{ zIndex: 9999 }}>
        <Command>
          <CommandInput 
            placeholder="Digite para buscar produtos..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.key}
                  value={product.description}
                  onSelect={() => handleSelect(product)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === product.description ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{product.description}</span>
                    <span className="text-sm text-gray-500">
                      {product.unitOfMeasure} - R$ {product.unitPrice.toFixed(2)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
