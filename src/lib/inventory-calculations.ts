
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
  // Calculate entries from approved invoices
  const entries = invoices
    .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
    .flatMap(invoice => 
      invoice.items.filter(item => 
        item.description === productDescription && 
        item.unitOfMeasure === unitOfMeasure
      )
    );

  const totalEntries = entries.reduce((sum, item) => sum + item.quantity, 0);
  const totalEntryCost = entries.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calculate exits from movements
  const exits = movements.filter(movement => 
    movement.productDescription === productDescription && 
    movement.unitOfMeasure === unitOfMeasure &&
    movement.type === 'saida'
  );

  const totalExits = exits.reduce((sum, movement) => sum + movement.quantity, 0);
  const currentStock = Math.max(0, totalEntries - totalExits);
  const averageUnitCost = totalEntries > 0 ? totalEntryCost / totalEntries : 0;

  return {
    productDescription,
    unitOfMeasure,
    totalEntries,
    totalExits,
    currentStock,
    averageUnitCost,
    totalValue: currentStock * averageUnitCost
  };
};

export const getAllProductsStock = (
  invoices: Invoice[],
  movements: InventoryMovement[]
): StockCalculation[] => {
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

  return Array.from(productMap.values()).map(product =>
    calculateProductStock(product.description, product.unit, invoices, movements)
  );
};

export const checkLowStock = (
  stockCalculations: StockCalculation[],
  minStockThreshold: number = 10
): StockCalculation[] => {
  return stockCalculations.filter(stock => 
    stock.currentStock <= minStockThreshold && stock.currentStock > 0
  );
};

export const validateExitQuantity = (
  productDescription: string,
  unitOfMeasure: string,
  requestedQuantity: number,
  invoices: Invoice[],
  movements: InventoryMovement[]
): { isValid: boolean; availableStock: number; message?: string } => {
  const stock = calculateProductStock(productDescription, unitOfMeasure, invoices, movements);
  
  if (requestedQuantity <= 0) {
    return {
      isValid: false,
      availableStock: stock.currentStock,
      message: "Quantidade deve ser maior que zero"
    };
  }

  if (requestedQuantity > stock.currentStock) {
    return {
      isValid: false,
      availableStock: stock.currentStock,
      message: `Estoque insuficiente. Disponível: ${stock.currentStock} ${unitOfMeasure}`
    };
  }

  return {
    isValid: true,
    availableStock: stock.currentStock
  };
};
