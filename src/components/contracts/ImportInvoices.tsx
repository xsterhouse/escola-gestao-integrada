
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type InvoiceStatus = "pending" | "validating" | "valid" | "invalid";

type Invoice = {
  id: string;
  filename: string;
  status: InvoiceStatus;
  supplier: string;
  totalValue: number;
  items: { name: string; quantity: number; value: number }[];
};

export function ImportInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newInvoice: Invoice = {
        id: `nfe-${Date.now()}`,
        filename: selectedFiles[0].name,
        status: "validating",
        supplier: "Carregando dados...",
        totalValue: 0,
        items: []
      };
      
      setInvoices([...invoices, newInvoice]);
      
      // Simulate validation process
      setTimeout(() => {
        setInvoices(prev => 
          prev.map(inv => 
            inv.id === newInvoice.id
              ? {
                  ...inv,
                  status: "valid",
                  supplier: "Editora Educação LTDA",
                  totalValue: 22950,
                  items: [
                    { name: "Livro Didático Matemática", quantity: 500, value: 45.90 }
                  ]
                }
              : inv
          )
        );
        
        toast({
          title: "Nota fiscal validada",
          description: "A NF-e foi importada e validada com sucesso.",
        });
      }, 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importação de Notas Fiscais (NF-e XML)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          <label className="flex flex-col items-center cursor-pointer">
            <Upload className="h-10 w-10 mb-2 text-gray-500" />
            <span className="text-sm font-medium mb-1">Clique para fazer upload</span>
            <span className="text-xs text-muted-foreground mb-3">Arquivos XML de NF-e</span>
            <Button variant="outline">Selecionar arquivo</Button>
            <input
              type="file"
              className="hidden"
              accept=".xml"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {invoices.length > 0 && (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="border rounded-md p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{invoice.filename}</span>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
                
                {invoice.status === "validating" ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-primary border-b-transparent" />
                    <span>Validando nota fiscal...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fornecedor:</span>
                        <span className="ml-1 font-medium">{invoice.supplier}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor Total:</span>
                        <span className="ml-1 font-medium">
                          R$ {invoice.totalValue.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                      <h4 className="text-sm font-medium mb-1">Itens da Nota:</h4>
                      <ul className="space-y-1">
                        {invoice.items.map((item, index) => (
                          <li key={index} className="text-sm flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>R$ {(item.quantity * item.value).toFixed(2).replace('.', ',')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const statusConfig = {
    pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
    validating: { label: "Validando", className: "bg-blue-100 text-blue-800" },
    valid: { label: "Válida", className: "bg-green-100 text-green-800" },
    invalid: { label: "Inválida", className: "bg-red-100 text-red-800" }
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      config.className
    )}>
      {status === "valid" && <Check className="mr-1 h-3 w-3" />}
      {status === "invalid" && <AlertCircle className="mr-1 h-3 w-3" />}
      {config.label}
    </span>
  );
}
