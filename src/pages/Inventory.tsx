
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
import { v4 as uuidv4 } from "uuid";

export default function Inventory() {
  const { data: invoices, saveData: setInvoices } = useLocalStorageSync<Invoice>('invoices', []);
  const { data: deletionHistory, saveData: setDeletionHistory } = useLocalStorageSync<DeletionHistory>('deletion-history', []);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isImportXmlOpen, setIsImportXmlOpen] = useState(false);
  
  const handleAddInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    setIsAddInvoiceOpen(false);
  };

  const handleXmlImport = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    setIsImportXmlOpen(false);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    );
    setInvoices(updatedInvoices);
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
      setDeletionHistory([...deletionHistory, deletionRecord]);
      
      // Remover a nota fiscal da lista
      const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
      setInvoices(updatedInvoices);
    }
  };

  return (
    <AppLayout requireAuth={true} requiredPermission="inventory">
      <div className="space-y-6">
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
