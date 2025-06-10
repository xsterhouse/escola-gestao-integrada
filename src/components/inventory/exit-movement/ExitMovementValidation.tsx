
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ExitMovementValidationProps {
  errors: string[];
}

export function ExitMovementValidation({ errors }: ExitMovementValidationProps) {
  if (errors.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Corrija os seguintes erros:</p>
            <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
