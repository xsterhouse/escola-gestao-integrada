
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteProductDialogProps {
  mode: "single" | "multiple" | null;
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProductDialog({
  mode,
  count,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProductDialogProps) {
  const isSingleMode = mode === "single";
  const hasSelectedItems = count > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSingleMode
              ? "Excluir produto"
              : hasSelectedItems
              ? `Excluir ${count} produtos`
              : "Excluir produtos"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSingleMode
              ? "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
              : hasSelectedItems
              ? `Tem certeza que deseja excluir ${count} produtos selecionados? Esta ação não pode ser desfeita.`
              : "Nenhum produto foi selecionado para exclusão. Selecione pelo menos um produto para continuar."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {(isSingleMode || hasSelectedItems) && (
            <AlertDialogAction onClick={onConfirm}>
              Excluir
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
