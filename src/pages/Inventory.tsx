
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryMovements } from "@/components/inventory/InventoryMovements";
import { InventoryReports } from "@/components/inventory/InventoryReports";
import { InventoryHistory } from "@/components/inventory/InventoryHistory";
import { AddInvoiceDialog } from "@/components/inventory/AddInvoiceDialog";
import { ImportXmlDialog } from "@/components/inventory/ImportXmlDialog";
import { Invoice, DeletionHistory } from "@/lib/types";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

export default function Inventory() {
  const { currentSchool } = useAuth();
  
  // Use standardized keys with schoolId
  const invoicesKey = currentSchool ? `invoices_${currentSchool.id}` : 'invoices';
  const deletionHistoryKey = currentSchool ? `deletion-history_${currentSchool.id}` : 'deletion-history';
  
  const { data: invoices, saveData: setInvoices } = useLocalStorageSync<Invoice>(invoicesKey, []);
  const { data: deletionHistory, saveData: setDeletionHistory } = useLocalStorageSync<DeletionHistory>(deletionHistoryKey, []);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isImportXmlOpen, setIsImportXmlOpen] = useState(false);
  
  console.log(`📋 Carregando inventário com chave: ${invoicesKey} - ${invoices.length} notas fiscais`);
  
  const handleAddInvoice = (invoice: Invoice) => {
    const updatedInvoices = [...invoices, invoice];
    setInvoices(updatedInvoices);
    setIsAddInvoiceOpen(false);
    console.log(`✅ Nova nota fiscal adicionada: ${invoice.id}`);
  };

  const handleXmlImport = (invoice: Invoice) => {
    const updatedInvoices = [...invoices, invoice];
    setInvoices(updatedInvoices);
    setIsImportXmlOpen(false);
    console.log(`✅ XML importado: ${invoice.id}`);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    );
    setInvoices(updatedInvoices);
    console.log(`📝 Nota fiscal atualizada: ${updatedInvoice.id}`);
  };

  const handleDeleteInvoice = (invoiceId: string, reason: string, deletedBy: string) => {
    const invoiceToDelete = invoices.find(invoice => invoice.id === invoiceId);
    
    if (invoiceToDelete) {
      // Criar registro no histórico de exclusões
      const deletionRecord: DeletionHistory = {
        id: uuidv4(),
        entityType: "invoice",
        entityId: invoiceToDelete.id,
        entityName: `NF ${invoiceToDelete.danfeNumber}`,
        danfeNumber: invoiceToDelete.danfeNumber,
        supplierName: invoiceToDelete.supplier.name,
        supplierCnpj: invoiceToDelete.supplier.cnpj,
        issueDate: invoiceToDelete.issueDate,
        totalValue: invoiceToDelete.totalValue,
        items: invoiceToDelete.items,
        deletedBy,
        deletedAt: new Date(),
        reason,
      };
      
      // Adicionar ao histórico de exclusões
      const updatedDeletionHistory = [...deletionHistory, deletionRecord];
      setDeletionHistory(updatedDeletionHistory);
      
      // Remover a nota fiscal da lista
      const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
      setInvoices(updatedInvoices);
      
      console.log(`🗑️ Nota fiscal excluída: ${invoiceId} - Motivo: ${reason}`);
    }
  };

  return (
    <AppLayout requireAuth={true} requiredPermission="inventory">
      <div className="px-6 py-6 space-y-6">
        <InventoryHeader 
          onAddInvoice={() => setIsAddInvoiceOpen(true)}
          onImportXml={() => setIsImportXmlOpen(true)}
        />

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="inventory">Estoque</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-4">
            <InventoryTable 
              invoices={invoices} 
              onUpdateInvoice={handleUpdateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
            />
          </TabsContent>

          <TabsContent value="movements" className="mt-4">
            <InventoryMovements invoices={invoices} />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <InventoryReports invoices={invoices} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <InventoryHistory deletionHistory={deletionHistory} />
          </TabsContent>
        </Tabs>
      </div>

      <AddInvoiceDialog 
        open={isAddInvoiceOpen} 
        onOpenChange={setIsAddInvoiceOpen}
        onSubmit={handleAddInvoice}
      />

      <ImportXmlDialog
        open={isImportXmlOpen}
        onOpenChange={setIsImportXmlOpen}
        onSubmit={handleXmlImport}
        existingInvoices={invoices}
      />
    </AppLayout>
  );
}
