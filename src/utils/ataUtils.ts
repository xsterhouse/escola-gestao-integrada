
export interface ATAForContracts {
  id: string;
  numeroATA: string;
  status: "rascunho" | "finalizada" | "aprovada";
  valorTotal: number;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  items: Array<{
    id: string;
    numeroItem: string;
    descricaoProduto: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
}

export const getApprovedATAs = (): ATAForContracts[] => {
  try {
    const storedATAs = localStorage.getItem("atas");
    if (storedATAs) {
      const atas = JSON.parse(storedATAs);
      return atas.filter((ata: ATAForContracts) => ata.status === "aprovada");
    }
    return [];
  } catch (error) {
    console.error("Error loading approved ATAs:", error);
    return [];
  }
};

export const getAllATAs = (): ATAForContracts[] => {
  try {
    const storedATAs = localStorage.getItem("atas");
    if (storedATAs) {
      return JSON.parse(storedATAs);
    }
    return [];
  } catch (error) {
    console.error("Error loading ATAs:", error);
    return [];
  }
};

export const getATAById = (id: string): ATAForContracts | null => {
  const atas = getAllATAs();
  return atas.find(ata => ata.id === id) || null;
};

export const getATAByNumber = (numeroATA: string): ATAForContracts | null => {
  const atas = getAllATAs();
  return atas.find(ata => ata.numeroATA === numeroATA) || null;
};
