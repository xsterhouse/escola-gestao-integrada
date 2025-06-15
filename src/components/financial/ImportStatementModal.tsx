import { useState } from "react";
import { FileUp, Upload, X, Check } from "lucide-react";
import { BankAccount, BankTransaction } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface ImportStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  onImport: (transactions: BankTransaction[]) => void;
}

export function ImportStatementModal({ 
  isOpen, 
  onClose, 
  bankAccounts,
  onImport
}: ImportStatementModalProps) {
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewTransactions, setPreviewTransactions] = useState<BankTransaction[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  const acceptedFileTypes = ".ofx,.csv,.xml";
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFileType(selectedFile)) {
        setFile(selectedFile);
        // In a real application, you would parse the file here
        // For now, we'll simulate this with a timeout
        toast.success(`Arquivo ${selectedFile.name} selecionado`);
      } else {
        toast.error("Tipo de arquivo inválido. Por favor, selecione um arquivo .ofx, .csv ou .xml");
        e.target.value = "";
      }
    }
  };
  
  const validateFileType = (file: File): boolean => {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    return fileType === 'ofx' || fileType === 'csv' || fileType === 'xml';
  };
  
  const handleAnalyzeFile = () => {
    if (!bankAccountId) {
      toast.error("Selecione uma conta bancária");
      return;
    }
    
    if (!file) {
      toast.error("Selecione um arquivo para importar");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate file processing with a timeout
    setTimeout(() => {
      // Generate mock transactions for preview
      const mockTransactions: BankTransaction[] = [
        {
          id: uuidv4(),
          bankAccountId,
          date: new Date().toISOString(),
          description: "Transferência Recebida",
          value: 1250.50,
          transactionType: "credito",
          reconciliationStatus: "pendente",
          source: "manual",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          bankAccountId,
          date: new Date().toISOString(),
          description: "Pagamento Fornecedor XYZ",
          value: 546.78,
          transactionType: "debito",
          reconciliationStatus: "pendente",
          source: "manual",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          bankAccountId,
          date: new Date().toISOString(),
          description: "Tarifa Bancária",
          value: 45.90,
          transactionType: "debito",
          reconciliationStatus: "pendente",
          source: "manual",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setPreviewTransactions(mockTransactions);
      setShowPreview(true);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleImport = () => {
    if (previewTransactions.length === 0) {
      toast.error("Não há transações para importar");
      return;
    }
    
    onImport(previewTransactions);
    toast.success(`${previewTransactions.length} transações importadas com sucesso!`);
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setBankAccountId("");
    setFile(null);
    setPreviewTransactions([]);
    setShowPreview(false);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Importar Extrato Bancário</DialogTitle>
          <DialogDescription>
            Selecione um arquivo .OFX, .CSV ou .XML para importar transações bancárias
          </DialogDescription>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Conta Bancária</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
                  file ? "border-primary" : "border-input"
                )}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept={acceptedFileTypes}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                {file ? (
                  <div className="mt-2">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Clique para selecionar um arquivo</p>
                    <p className="text-xs text-muted-foreground">ou arraste e solte</p>
                    <p className="text-xs text-muted-foreground mt-2">OFX, CSV ou XML até 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <h3 className="text-lg font-medium mb-2">Pré-visualização das Transações</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {previewTransactions.length} transações encontradas. Verifique e confirme para importar.
            </p>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-2 px-4 text-left">Data</th>
                    <th className="py-2 px-4 text-left">Descrição</th>
                    <th className="py-2 px-4 text-right">Valor</th>
                    <th className="py-2 px-4 text-left">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {previewTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-muted">
                      <td className="py-2 px-4">{formatDate(new Date(transaction.date))}</td>
                      <td className="py-2 px-4">{transaction.description}</td>
                      <td className={cn(
                        "py-2 px-4 text-right",
                        transaction.transactionType === "credito" ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(transaction.value)}
                      </td>
                      <td className="py-2 px-4">
                        {transaction.transactionType === "credito" ? "Crédito" : "Débito"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted font-medium">
                  <tr>
                    <td colSpan={2} className="py-2 px-4 text-right">Total:</td>
                    <td className="py-2 px-4 text-right">
                      {formatCurrency(previewTransactions.reduce((sum, t) => {
                        return t.transactionType === "credito" 
                          ? sum + t.value 
                          : sum - t.value;
                      }, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {!showPreview ? (
            <>
              <Button variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleAnalyzeFile} disabled={!file || !bankAccountId || isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analisando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Analisar Arquivo
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Voltar
              </Button>
              <Button onClick={handleImport}>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Importação
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
