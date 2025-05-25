
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
  
  // Extract unique products from all invoices
  const allProducts = invoices.flatMap(invoice => 
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
    onProductSelect({
      description: product.description,
      unitOfMeasure: product.unitOfMeasure,
      unitPrice: product.unitPrice
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Digite para buscar produtos..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.key}
                  value={product.description}
                  onSelect={() => handleSelect(product)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.description ? "opacity-100" : "opacity-0"
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
