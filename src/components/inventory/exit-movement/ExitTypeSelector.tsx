
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EXIT_TYPES = [
  { value: 'consumo', label: 'Consumo' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'perda', label: 'Perda' },
  { value: 'vencimento', label: 'Vencimento' },
  { value: 'doacao', label: 'Doação' },
  { value: 'outros', label: 'Outros' }
];

interface ExitTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExitTypeSelector({ value, onChange }: ExitTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="exitType">Tipo de Saída *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de saída" />
        </SelectTrigger>
        <SelectContent>
          {EXIT_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { EXIT_TYPES };
