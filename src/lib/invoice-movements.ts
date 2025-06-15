
import { Invoice, InventoryMovement } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export const generateMovementsFromInvoices = (invoices: Invoice[]): InventoryMovement[] => {
  const movements: InventoryMovement[] = [];

  invoices
    .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
    .forEach(invoice => {
      invoice.items.forEach(item => {
        const movement: InventoryMovement = {
          id: uuidv4(),
          date: invoice.issueDate,
          productDescription: item.description,
          quantity: item.quantity,
          unitOfMeasure: item.unitOfMeasure,
          type: 'entrada',
          reason: `Entrada via Nota Fiscal ${invoice.danfeNumber || invoice.invoiceNumber}`,
          unitPrice: item.unitPrice,
          totalCost: item.totalPrice,
          source: 'invoice',
          status: 'entrada',
          invoiceId: invoice.id,
          createdAt: invoice.createdAt || new Date().toISOString(),
          updatedAt: invoice.updatedAt || new Date().toISOString()
        };
        movements.push(movement);
      });
    });

  return movements;
};
