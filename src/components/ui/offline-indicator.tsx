
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncManager } from '@/hooks/useSyncManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock
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
  const [isExpanded, setIsExpanded] = useState(false);

  const getConnectionBadge = () => {
    if (!isOnline) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
        <Wifi className="h-3 w-3" />
        Online {effectiveType && `(${effectiveType})`}
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
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="max-w-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {getConnectionBadge()}
              
              {pendingCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {pendingCount > 0 && isOnline && (
                <Button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              )}
              
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size="sm"
                variant="ghost"
                className="px-2"
              >
                {isExpanded ? '−' : '+'}
              </Button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Status da conexão:</span>
                <span className="flex items-center gap-1">
                  {isOnline ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      Desconectado
                    </>
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Última sincronização:</span>
                <span>{formatLastSync()}</span>
              </div>
              
              {!isOnline && pendingCount > 0 && (
                <div className="text-orange-600 text-xs">
                  ⚠️ Dados serão sincronizados quando a conexão for restabelecida
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
