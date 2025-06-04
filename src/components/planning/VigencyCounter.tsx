
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, AlertTriangle } from "lucide-react";

interface VigencyCounterProps {
  endDate: Date;
  ataNumber: string;
}

export function VigencyCounter({ endDate, ataNumber }: VigencyCounterProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, expired: false });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const getStatusColor = () => {
    if (timeLeft.expired) return "text-red-600 border-red-200 bg-red-50";
    if (timeLeft.days <= 30) return "text-orange-600 border-orange-200 bg-orange-50";
    return "text-green-600 border-green-200 bg-green-50";
  };

  const getStatusIcon = () => {
    if (timeLeft.expired) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (timeLeft.days <= 30) return <Clock className="h-5 w-5 text-orange-600" />;
    return <Calendar className="h-5 w-5 text-green-600" />;
  };

  return (
    <Card className={`${getStatusColor()} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold">{ataNumber}</h3>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
            {timeLeft.expired ? "EXPIRADA" : "VIGENTE"}
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold">{timeLeft.days}</div>
            <div className="text-xs opacity-75">Dias</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{timeLeft.hours}</div>
            <div className="text-xs opacity-75">Horas</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{timeLeft.minutes}</div>
            <div className="text-xs opacity-75">Min</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{timeLeft.seconds}</div>
            <div className="text-xs opacity-75">Seg</div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-center opacity-75">
          Expira em: {new Date(endDate).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
}
