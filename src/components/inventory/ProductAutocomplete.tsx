
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
    console.log("🎯 Produto selecionado:", product);
    
    setSelectedValue(product.description);
    
    onProductSelect({
      description: product.description,
      unitOfMeasure: product.unitOfMeasure,
      unitPrice: product.unitPrice
    });
    
    setSearchValue("");
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  const clearSelection = () => {
    setSelectedValue("");
    setSearchValue("");
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 text-left"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
                {selectedValue || placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" sideOffset={4}>
          <Command>
            <CommandInput 
              placeholder="Digite para buscar produtos..." 
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-12"
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum produto encontrado.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tente buscar com outros termos
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.key}
                    value={product.description}
                    onSelect={() => handleSelect(product)}
                    className="cursor-pointer py-3"
                  >
                    <Check
                      className={cn(
                        "mr-3 h-4 w-4",
                        selectedValue === product.description ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{product.description}</span>
                        <Badge variant="secondary" className="ml-2">
                          R$ {product.unitPrice.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Unidade: {product.unitOfMeasure}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedValue && (
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm">
            Produto selecionado: {selectedValue}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 px-2 text-xs"
          >
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
}
