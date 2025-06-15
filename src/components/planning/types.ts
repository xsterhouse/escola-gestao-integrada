
export interface ProductSuggestion {
  id: string;
  description: string;
  unit: string;
  item?: string;
  availableStock?: number;
  averageUnitCost?: number;
}
