
export interface ATAFormData {
  escola: string;
  centralCompras: string;
  dataATA: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  observacoes?: string;
  items: {
    nome: string;
    unidade: string;
    quantidade: number;
    descricao?: string;
  }[];
}
