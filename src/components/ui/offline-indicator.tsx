
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncManager } from '@/hooks/useSyncManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

export function OfflineIndicator() {
  const { isOnline, effectiveType } = useNetworkStatus();
  const { 
    isSyncing, 
    pendingCount, 
    lastSyncTime, 
    handleManualSync 
  } = useSyncManager();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const getConnectionBadge = () => {
    if (!isOnline) {
      return (
        <Badge variant="destructive" className={`flex items-center gap-1 ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
          <WifiOff className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
          Offline
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className={`flex items-center gap-1 text-green-600 border-green-600 ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
        <Wifi className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
        Online {effectiveType && !isMobile && `(${effectiveType})`}
      </Badge>
    );
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Agora há pouco';
    if (diffMinutes < 60) return `${diffMinutes}min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    return lastSyncTime.toLocaleDateString('pt-BR');
  };

  return (
    <div className={`fixed ${isMobile ? 'bottom-2 right-2 left-2' : 'bottom-4 right-4'} z-50`}>
      <Card className={`${isMobile ? 'w-full' : 'max-w-sm'} shadow-lg`}>
        <CardContent className={`${isMobile ? 'p-2' : 'p-3'}`}>
          <div className={`flex items-center justify-between ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
              {getConnectionBadge()}
              
              {pendingCount > 0 && (
                <Badge variant="secondary" className={`flex items-center gap-1 ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
                  <Clock className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  {pendingCount} {isMobile ? 'pend.' : `pendente${pendingCount > 1 ? 's' : ''}`}
                </Badge>
              )}
            </div>
            
            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
              {pendingCount > 0 && isOnline && (
                <Button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  size={isMobile ? "sm" : "sm"}
                  variant="outline"
                  className={`flex items-center gap-1 ${isMobile ? 'px-2 py-1 text-xs' : ''}`}
                >
                  <RefreshCw className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} ${isSyncing ? 'animate-spin' : ''}`} />
                  {isMobile ? 'Sync' : (isSyncing ? 'Sincronizando...' : 'Sincronizar')}
                </Button>
              )}
              
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size={isMobile ? "sm" : "sm"}
                variant="ghost"
                className={`${isMobile ? 'px-1' : 'px-2'}`}
              >
                {isExpanded ? 
                  <ChevronDown className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} /> : 
                  <ChevronUp className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                }
              </Button>
            </div>
          </div>
          
          {isExpanded && (
            <div className={`pt-3 border-t space-y-2 text-muted-foreground ${isMobile ? 'mt-2 text-xs' : 'mt-3 text-sm'}`}>
              <div className="flex items-center justify-between">
                <span>Status da conexão:</span>
                <span className="flex items-center gap-1">
                  {isOnline ? (
                    <>
                      <CheckCircle2 className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-green-600`} />
                      {isMobile ? 'On' : 'Conectado'}
                    </>
                  ) : (
                    <>
                      <AlertCircle className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-red-600`} />
                      {isMobile ? 'Off' : 'Desconectado'}
                    </>
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Última sincronização:</span>
                <span>{formatLastSync()}</span>
              </div>
              
              {!isOnline && pendingCount > 0 && (
                <div className={`text-orange-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  ⚠️ Dados serão sincronizados quando a conexão for restabelecida
                </div>
              )}

              {effectiveType && !isMobile && (
                <div className="flex items-center justify-between">
                  <span>Tipo de conexão:</span>
                  <span className="uppercase">{effectiveType}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
