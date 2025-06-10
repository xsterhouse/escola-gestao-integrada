
import { Card, CardContent } from "@/components/ui/card";
import { School } from "@/lib/types";

interface OriginSchoolDisplayProps {
  currentSchool: School | null;
}

export function OriginSchoolDisplay({ currentSchool }: OriginSchoolDisplayProps) {
  if (!currentSchool) return null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-4">
        <div>
          <p className="font-medium text-blue-900">Escola de Origem</p>
          <p className="text-blue-700">{currentSchool.name}</p>
          {currentSchool.code && (
            <p className="text-sm text-blue-600">Código: {currentSchool.code}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
