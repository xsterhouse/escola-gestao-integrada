
import React, { useState } from "react";
import { Check, ChevronDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tenant } from "@/lib/types";
import { multiTenantService } from "@/services/multiTenantService";

interface TenantSelectorProps {
  tenants: Tenant[];
  currentTenantId?: string;
  onTenantChange: (tenantId: string) => void;
  disabled?: boolean;
}

export function TenantSelector({ 
  tenants, 
  currentTenantId, 
  onTenantChange, 
  disabled 
}: TenantSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const currentTenant = tenants.find(t => t.id === currentTenantId);

  const handleTenantSelect = (tenantId: string) => {
    if (tenantId !== currentTenantId) {
      onTenantChange(tenantId);
    }
    setOpen(false);
  };

  if (tenants.length <= 1) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {currentTenant?.name || "Nenhuma organização"}
        </span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {currentTenant?.name || "Selecionar organização"}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Buscar organização..." />
          <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>
          <CommandGroup>
            {tenants.map((tenant) => (
              <CommandItem
                key={tenant.id}
                value={tenant.id}
                onSelect={() => handleTenantSelect(tenant.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentTenantId === tenant.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{tenant.name}</span>
                      {tenant.domain && (
                        <span className="text-xs text-muted-foreground">
                          {tenant.domain}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {tenant.isActive ? (
                      <Badge variant="default" className="text-xs">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
