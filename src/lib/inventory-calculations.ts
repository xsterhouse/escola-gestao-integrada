
import { Invoice, InventoryMovement } from "@/lib/types";

export interface StockCalculation {
  productDescription: string;
  unitOfMeasure: string;
  totalEntries: number;
  totalExits: number;
  currentStock: number;
  averageUnitCost: number;
  totalValue: number;
}

export const calculateProductStock = (
  productDescription: string,
  unitOfMeasure: string,
  invoices: Invoice[],
  movements: InventoryMovement[]
): StockCalculation => {
  console.log(`📊 Calculando estoque para: ${productDescription} (${unitOfMeasure})`);
  
  // Calculate entries from approved invoices
  const invoiceEntries = invoices
    .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
    .flatMap(invoice => 
      invoice.items.filter(item => 
        item.description === productDescription && 
        item.unitOfMeasure === unitOfMeasure
      )
    );

  const totalInvoiceEntriesQty = invoiceEntries.reduce((sum, item) => sum + item.quantity, 0);
  const totalInvoiceEntriesCost = invoiceEntries.reduce((sum, item) => sum + item.totalPrice, 0);

  console.log(`📥 Entradas via notas fiscais: ${totalInvoiceEntriesQty} ${unitOfMeasure}`);

  // Filter all movements for the specific product
  const productMovements = movements.filter(movement => 
    movement.productDescription === productDescription && 
    movement.unitOfMeasure === unitOfMeasure
  );

  // Calculate entries from manual movements
  const manualEntries = productMovements.filter(m => m.type === 'entrada');
  const totalManualEntriesQty = manualEntries.reduce((sum, item) => sum + item.quantity, 0);
  const totalManualEntriesCost = manualEntries.reduce((sum, item) => sum + (item.totalCost || item.quantity * (item.unitPrice || 0)), 0);

  console.log(`📥 Entradas manuais: ${totalManualEntriesQty} ${unitOfMeasure}`);

  const totalEntries = totalInvoiceEntriesQty + totalManualEntriesQty;
  const totalEntryCost = totalInvoiceEntriesCost + totalManualEntriesCost;

  // Calculate exits from movements (THIS IS THE KEY PART FOR AUTOMATIC DEDUCTION)
  const exits = productMovements.filter(movement => movement.type === 'saida');
  const totalExits = exits.reduce((sum, movement) => sum + movement.quantity, 0);

  console.log(`📤 Total de saídas: ${totalExits} ${unitOfMeasure}`);
  console.log(`📊 Cálculo: ${totalEntries} (entradas) - ${totalExits} (saídas) = ${totalEntries - totalExits} (estoque atual)`);

  const currentStock = Math.max(0, totalEntries - totalExits);
  const averageUnitCost = totalEntries > 0 ? totalEntryCost / totalEntries : 0;

  const stockResult = {
    productDescription,
    unitOfMeasure,
    totalEntries,
    totalExits,
    currentStock,
    averageUnitCost,
    totalValue: currentStock * averageUnitCost
  };

  console.log(`✅ Resultado do cálculo de estoque:`, stockResult);
  
  return stockResult;
};

export const getAllProductsStock = (
  invoices: Invoice[],
  movements: InventoryMovement[]
): StockCalculation[] => {
  console.log("📋 Calculando estoque de todos os produtos...");
  
  const productMap = new Map<string, { description: string; unit: string }>();

  // Get all unique products from invoices
  invoices
    .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
    .forEach(invoice => {
      invoice.items.forEach(item => {
        const key = `${item.description}-${item.unitOfMeasure}`;
        productMap.set(key, {
          description: item.description,
          unit: item.unitOfMeasure
        });
      });
    });

  // Get all unique products from movements
  movements.forEach(movement => {
    const key = `${movement.productDescription}-${movement.unitOfMeasure}`;
    productMap.set(key, {
      description: movement.productDescription,
      unit: movement.unitOfMeasure
    });
  });

  const stockCalculations = Array.from(productMap.values()).map(product =>
    calculateProductStock(product.description, product.unit, invoices, movements)
  );

  console.log(`📊 Cálculo concluído para ${stockCalculations.length} produtos únicos`);
  
  return stockCalculations;
};

export const checkLowStock = (
  stockCalculations: StockCalculation[],
  minStockThreshold: number = 10
): StockCalculation[] => {
  const lowStockItems = stockCalculations.filter(stock => 
    stock.currentStock <= minStockThreshold && stock.currentStock > 0
  );
  
  console.log(`⚠️ Encontrados ${lowStockItems.length} itens com estoque baixo (≤ ${minStockThreshold})`);
  
  return lowStockItems;
};

export const validateExitQuantity = (
  productDescription: string,
  unitOfMeasure: string,
  requestedQuantity: number,
  invoices: Invoice[],
  movements: InventoryMovement[]
): { isValid: boolean; availableStock: number; message?: string } => {
  console.log(`🔍 Validando saída: ${requestedQuantity} ${unitOfMeasure} de ${productDescription}`);
  
  const stock = calculateProductStock(productDescription, unitOfMeasure, invoices, movements);
  
  if (requestedQuantity <= 0) {
    return {
      isValid: false,
      availableStock: stock.currentStock,
      message: "Quantidade deve ser maior que zero"
    };
  }

  if (requestedQuantity > stock.currentStock) {
    console.log(`❌ Estoque insuficiente: solicitado ${requestedQuantity}, disponível ${stock.currentStock}`);
    return {
      isValid: false,
      availableStock: stock.currentStock,
      message: `Estoque insuficiente. Disponível: ${stock.currentStock} ${unitOfMeasure}`
    };
  }

  console.log(`✅ Validação aprovada: ${requestedQuantity} ≤ ${stock.currentStock}`);
  return {
    isValid: true,
    availableStock: stock.currentStock
  };
};
