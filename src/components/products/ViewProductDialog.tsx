
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/lib/types";

interface ViewProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProductDialog({ product, open, onOpenChange }: ViewProductDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Produto</DialogTitle>
          <DialogDescription>
            Visualize todas as informações detalhadas do produto selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Item:</span>
            <span className="col-span-3">{product.item}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Descrição:</span>
            <span className="col-span-3">{product.description}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Unidade:</span>
            <span className="col-span-3">{product.unit}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Quantidade:</span>
            <span className="col-span-3">{product.quantity || "-"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Agricultura Familiar:</span>
            <span className="col-span-3">{product.familyAgriculture ? "Sim" : "Não"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Indicação:</span>
            <span className="col-span-3">{product.indication || "Não informado"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Restrição:</span>
            <span className="col-span-3">{product.restriction || "Não informado"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Data de Criação:</span>
            <span className="col-span-3">
              {new Date(product.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right">Última Atualização:</span>
            <span className="col-span-3">
              {new Date(product.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
