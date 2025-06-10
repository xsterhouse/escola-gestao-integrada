
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School, PurchasingCenter } from "@/lib/types";

interface DestinationSelectorProps {
  destinationType: 'school' | 'purchasing_center';
  destinationId: string;
  schools: School[];
  purchasingCenters: PurchasingCenter[];
  onDestinationTypeChange: (value: 'school' | 'purchasing_center') => void;
  onDestinationIdChange: (value: string) => void;
}

export function DestinationSelector({
  destinationType,
  destinationId,
  schools,
  purchasingCenters,
  onDestinationTypeChange,
  onDestinationIdChange
}: DestinationSelectorProps) {
  const destinationOptions = destinationType === 'school' ? schools : purchasingCenters;

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Destino</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="destinationType">Tipo de Destino *</Label>
          <Select 
            value={destinationType} 
            onValueChange={(value: 'school' | 'purchasing_center') => {
              onDestinationTypeChange(value);
              onDestinationIdChange(""); // Reset destination when type changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de destino" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="school">Escola</SelectItem>
              <SelectItem value="purchasing_center">Central de Compras</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">
            {destinationType === 'school' ? 'Escola de Destino' : 'Central de Compras de Destino'} *
          </Label>
          <Select value={destinationId} onValueChange={onDestinationIdChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${destinationType === 'school' ? 'a escola' : 'a central'}`} />
            </SelectTrigger>
            <SelectContent>
              {destinationOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                  {option.code && ` (${option.code})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
