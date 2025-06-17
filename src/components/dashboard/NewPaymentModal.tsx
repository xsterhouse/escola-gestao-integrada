
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentAccount, ReceivableAccount } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { getCurrentISOString } from "@/lib/date-utils";

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (payment: PaymentAccount) => void;
  onSaveReceivable: (receivable: ReceivableAccount) => void;
}

export function NewPaymentModal({ 
  isOpen, 
  onClose, 
  onSavePayment,
  onSaveReceivable
}: NewPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"payable" | "receivable">("payable");
  const [description, setDescription] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [value, setValue] = useState<string>("");
  const [resourceType, setResourceType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const resourceTypes = [
    { value: "pnae", label: "PNAE" },
    { value: "pnate", label: "PNATE" },
    { value: "recursos_proprios", label: "Recursos Próprios" },
    { value: "manutencao", label: "Manutenção" },
    { value: "outros", label: "Outros" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`Arquivo ${selectedFile.name} selecionado`);
    }
  };
  
  const handleSave = () => {
    // Validate fields
    if (!description) {
      toast.error("Informe uma descrição");
      return;
    }
    
    if (activeTab === "payable" && !supplier) {
      toast.error("Informe o fornecedor");
      return;
    }

    if (activeTab === "receivable" && !supplier) {
      toast.error("Informe a origem");
      return;
    }
    
    if (!value || parseFloat(value) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    if (!resourceType) {
      toast.error("Selecione o tipo de recurso");
      return;
    }
    
    if (activeTab === "payable") {
      // Create payable account
      const payment: PaymentAccount = {
        id: uuidv4(),
        schoolId: "current-school-id", // This would come from context in a real app
        description,
        supplier,
        value: parseFloat(value),
        dueDate: dueDate.toISOString(),
        category: resourceType, // Using resourceType as category
        expenseType: resourceType,
        resourceCategory: resourceType,
        status: "a_pagar",
        documentUrl: file ? URL.createObjectURL(file) : undefined,
        createdAt: getCurrentISOString(),
        updatedAt: getCurrentISOString()
      };
      
      onSavePayment(payment);
      toast.success("Conta a pagar cadastrada com sucesso!");
    } else {
      // Create receivable account
      const receivable: ReceivableAccount = {
        id: uuidv4(),
        schoolId: "current-school-id", // This would come from context in a real app
        description,
        origin: supplier,
        source: supplier, // Adding required source field
        category: resourceType, // Adding required category field
        resourceType,
        value: parseFloat(value),
        dueDate: dueDate.toISOString(), // Adding required dueDate field
        expectedDate: dueDate.toISOString(),
        status: "pendente",
        documentUrl: file ? URL.createObjectURL(file) : undefined,
        createdAt: getCurrentISOString(),
        updatedAt: getCurrentISOString()
      };
      
      onSaveReceivable(receivable);
      toast.success("Conta a receber cadastrada com sucesso!");
    }
    
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setDescription("");
    setSupplier("");
    setDueDate(new Date());
    setValue("");
    setResourceType("");
    setFile(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Lançamento Financeiro</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "payable" | "receivable")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payable" className="mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Informe uma descrição para o lançamento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Informe o fornecedor"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'dd/MM/yyyy') : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => date && setDueDate(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resourceType">Tipo de Recurso</Label>
                <Select value={resourceType} onValueChange={setResourceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Anexo (Opcional)</Label>
                <div 
                  className={cn(
                    "border border-input rounded-lg p-4 text-center cursor-pointer",
                    file ? "border-primary" : ""
                  )}
                  onClick={() => document.getElementById("attachment-upload")?.click()}
                >
                  <input
                    id="attachment-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  {file ? (
                    <p className="text-sm mt-2">{file.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">Clique para anexar um comprovante</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="receivable" className="mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Informe uma descrição para o lançamento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Origem</Label>
                <Input
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Informe a origem do recurso"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data Esperada</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'dd/MM/yyyy') : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => date && setDueDate(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resourceType">Tipo de Recurso</Label>
                <Select value={resourceType} onValueChange={setResourceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Anexo (Opcional)</Label>
                <div 
                  className={cn(
                    "border border-input rounded-lg p-4 text-center cursor-pointer",
                    file ? "border-primary" : ""
                  )}
                  onClick={() => document.getElementById("receivable-attachment-upload")?.click()}
                >
                  <input
                    id="receivable-attachment-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  {file ? (
                    <p className="text-sm mt-2">{file.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">Clique para anexar um comprovante</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
