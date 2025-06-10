
export interface ATAFormData {
  numeroProcesso: string;
  fornecedor: string;
  dataATA: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  observacoes: string;
  items: Array<{
    nome: string;
    unidade: string;
    quantidade: number;
    descricao?: string;
  }>;
}

export interface PlanningFormData {
  items: Array<{
    nome: string;
    unidade: string;
    quantidade: number;
    descricao?: string;
  }>;
}

export interface ProductSuggestion {
  id: string;
  description: string;
  unit: string;
  item?: number;
}
