"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  Link2,
  Link2Off,
  Loader2,
  RefreshCw,
  Shield,
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useBrokers, BrokerConnection, SupportedBroker, BrokerType } from "@/hooks/use-brokers";

// Status colors
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  disconnected: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  active: <CheckCircle2 className="h-3 w-3" />,
  error: <XCircle className="h-3 w-3" />,
  disconnected: <Link2Off className="h-3 w-3" />,
};

export default function BrokersPage() {
  const {
    isLoading,
    supportedBrokers,
    connections,
    syncHistory,
    fetchSupportedBrokers,
    fetchConnections,
    connectBroker,
    disconnectBroker,
    syncPositions,
    fetchSyncHistory,
    importToPortfolio,
    getBrokerName,
    getStatusLabel,
  } = useBrokers();

  const [selectedConnection, setSelectedConnection] = useState<BrokerConnection | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchSupportedBrokers();
    fetchConnections();
  }, [fetchSupportedBrokers, fetchConnections]);

  // Handle sync
  const handleSync = async (connectionId: number) => {
    setSyncingId(connectionId);
    await syncPositions(connectionId);
    setSyncingId(null);
  };

  // Handle view history
  const handleViewHistory = async (connection: BrokerConnection) => {
    setSelectedConnection(connection);
    await fetchSyncHistory(connection.id);
    setShowHistoryDialog(true);
  };

  // Handle import
  const handleImport = async (connectionId: number) => {
    await importToPortfolio(connectionId);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  // Get connected broker types
  const connectedTypes = new Set(connections.map((c) => c.broker_type));

  return (
    <div className="flex flex-col">
      <Header
        title="Corretoras"
        description="Conecte suas corretoras para importar posicoes automaticamente"
      />

      <div className="p-6 space-y-6">
        {/* Connected Brokers */}
        {connections.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Suas Conexoes</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {connections.map((connection) => (
                <Card key={connection.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {getBrokerName(connection.broker_type)}
                          </h3>
                          {connection.broker_account_name && (
                            <p className="text-sm text-muted-foreground">
                              {connection.broker_account_name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={statusColors[connection.status]}>
                              {statusIcons[connection.status]}
                              <span className="ml-1">{getStatusLabel(connection.status)}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {connection.last_error && (
                      <div className="mt-3 p-2 rounded bg-red-50 dark:bg-red-950 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {connection.last_error}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>Ultima sincronizacao: {formatDate(connection.last_sync_at)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(connection.id)}
                        disabled={isLoading || syncingId === connection.id || connection.status !== "active"}
                      >
                        {syncingId === connection.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Sincronizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImport(connection.id)}
                        disabled={isLoading || connection.status !== "active"}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Importar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(connection)}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Historico
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Link2Off className="mr-2 h-4 w-4" />
                            Desconectar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Desconectar corretora?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso ira remover a conexao com {getBrokerName(connection.broker_type)}.
                              Suas posicoes ja importadas serao mantidas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => disconnectBroker(connection.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Desconectar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Brokers */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Corretoras Disponiveis</h2>
          {isLoading && supportedBrokers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {supportedBrokers.map((broker) => {
                const isConnected = connectedTypes.has(broker.broker_type);
                return (
                  <Card
                    key={broker.broker_type}
                    className={isConnected ? "border-green-200 dark:border-green-800" : ""}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{broker.name}</CardTitle>
                            {isConnected && (
                              <Badge variant="outline" className="mt-1 text-green-600">
                                <Check className="mr-1 h-3 w-3" />
                                Conectado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {broker.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {broker.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isConnected ? (
                          <Button
                            className="flex-1"
                            onClick={() => connectBroker(broker.broker_type)}
                            disabled={isLoading}
                          >
                            <Link2 className="mr-2 h-4 w-4" />
                            Conectar
                          </Button>
                        ) : (
                          <Button variant="outline" className="flex-1" disabled>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            Conectado
                          </Button>
                        )}
                        {broker.documentation_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(broker.documentation_url!, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Security Note */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="flex items-start gap-4 p-4">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Conexao Segura
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Utilizamos OAuth 2.0 para conectar com sua corretora. Nunca armazenamos sua senha.
                Voce pode revogar o acesso a qualquer momento diretamente na sua corretora.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Historico de Sincronizacao
              {selectedConnection && (
                <span className="text-muted-foreground font-normal ml-2">
                  - {getBrokerName(selectedConnection.broker_type)}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Ultimas sincronizacoes realizadas
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto">
            {syncHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma sincronizacao realizada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {syncHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-start justify-between border rounded-lg p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            history.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : history.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {history.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {history.sync_type}
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        {history.records_synced} registros sincronizados
                        {history.records_created > 0 && ` (${history.records_created} novos)`}
                      </p>
                      {history.error_message && (
                        <p className="text-sm text-red-600 mt-1">{history.error_message}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <p>{formatDate(history.started_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
