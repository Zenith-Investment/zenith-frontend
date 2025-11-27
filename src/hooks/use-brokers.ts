"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
export type BrokerType = "xp" | "nuinvest" | "clear" | "rico" | "btg" | "inter" | "modal";
export type ConnectionStatus = "pending" | "active" | "error" | "disconnected";
export type SyncStatus = "pending" | "in_progress" | "completed" | "failed";

export interface SupportedBroker {
  broker_type: BrokerType;
  name: string;
  description: string;
  documentation_url: string | null;
  features: string[];
  requires_mtls: boolean;
  auth_type: string;
}

export interface BrokerConnection {
  id: number;
  broker_type: BrokerType;
  status: ConnectionStatus;
  broker_account_id: string | null;
  broker_account_name: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface SyncHistory {
  id: number;
  sync_type: string;
  status: SyncStatus;
  records_synced: number;
  records_created: number;
  records_updated: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface BrokerPosition {
  ticker: string;
  quantity: number;
  average_price: number;
  current_price: number | null;
  value: number;
  asset_class: string;
}

export function useBrokers() {
  const [isLoading, setIsLoading] = useState(false);
  const [supportedBrokers, setSupportedBrokers] = useState<SupportedBroker[]>([]);
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [positions, setPositions] = useState<BrokerPosition[]>([]);
  const { toast } = useToast();

  // Fetch supported brokers
  const fetchSupportedBrokers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ brokers: SupportedBroker[] }>("/brokers/supported");
      setSupportedBrokers(response.data.brokers);
      return response.data.brokers;
    } catch (error) {
      toast({
        title: "Erro ao carregar corretoras",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch user's connections
  const fetchConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ connections: BrokerConnection[] }>("/brokers/connections");
      setConnections(response.data.connections);
      return response.data.connections;
    } catch (error) {
      toast({
        title: "Erro ao carregar conexoes",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Start broker connection (OAuth)
  const connectBroker = useCallback(
    async (brokerType: BrokerType) => {
      try {
        setIsLoading(true);
        const response = await api.post<{ authorization_url: string; state: string }>(
          "/brokers/connect",
          { broker_type: brokerType }
        );

        // Redirect to OAuth URL
        window.location.href = response.data.authorization_url;
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao conectar corretora",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Complete OAuth callback
  const completeConnection = useCallback(
    async (brokerType: string, code: string, state: string) => {
      try {
        setIsLoading(true);
        const response = await api.post<BrokerConnection>(
          `/brokers/callback/${brokerType}`,
          { code, state }
        );
        await fetchConnections();
        toast({
          title: "Corretora conectada",
          description: "Sua corretora foi conectada com sucesso!",
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao completar conexao",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, fetchConnections]
  );

  // Disconnect broker
  const disconnectBroker = useCallback(
    async (connectionId: number) => {
      try {
        setIsLoading(true);
        await api.delete(`/brokers/connections/${connectionId}`);
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        toast({
          title: "Corretora desconectada",
          description: "A corretora foi desconectada com sucesso.",
        });
        return true;
      } catch (error) {
        toast({
          title: "Erro ao desconectar",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Sync positions
  const syncPositions = useCallback(
    async (connectionId: number) => {
      try {
        setIsLoading(true);
        const response = await api.post<{ sync_id: number; status: string; message: string }>(
          `/brokers/connections/${connectionId}/sync`
        );
        await fetchConnections();
        toast({
          title: "Sincronizacao concluida",
          description: response.data.message,
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao sincronizar",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, fetchConnections]
  );

  // Fetch sync history
  const fetchSyncHistory = useCallback(
    async (connectionId: number) => {
      try {
        setIsLoading(true);
        const response = await api.get<SyncHistory[]>(
          `/brokers/connections/${connectionId}/sync-history`
        );
        setSyncHistory(response.data);
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao carregar historico",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Fetch broker positions
  const fetchPositions = useCallback(
    async (connectionId: number) => {
      try {
        setIsLoading(true);
        const response = await api.get<BrokerPosition[]>(
          `/brokers/connections/${connectionId}/positions`
        );
        setPositions(response.data);
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao carregar posicoes",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Import positions to portfolio
  const importToPortfolio = useCallback(
    async (connectionId: number, portfolioId?: number) => {
      try {
        setIsLoading(true);
        const response = await api.post<{ message: string; imported_count: number }>(
          `/brokers/connections/${connectionId}/import-to-portfolio`,
          { portfolio_id: portfolioId }
        );
        toast({
          title: "Importacao concluida",
          description: response.data.message,
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao importar",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Get broker name
  const getBrokerName = (brokerType: BrokerType): string => {
    const names: Record<BrokerType, string> = {
      xp: "XP Investimentos",
      nuinvest: "NuInvest",
      clear: "Clear Corretora",
      rico: "Rico",
      btg: "BTG Pactual",
      inter: "Banco Inter",
      modal: "Modal Mais",
    };
    return names[brokerType] || brokerType;
  };

  // Get status label
  const getStatusLabel = (status: ConnectionStatus): string => {
    const labels: Record<ConnectionStatus, string> = {
      pending: "Pendente",
      active: "Ativo",
      error: "Erro",
      disconnected: "Desconectado",
    };
    return labels[status] || status;
  };

  return {
    isLoading,
    supportedBrokers,
    connections,
    syncHistory,
    positions,
    fetchSupportedBrokers,
    fetchConnections,
    connectBroker,
    completeConnection,
    disconnectBroker,
    syncPositions,
    fetchSyncHistory,
    fetchPositions,
    importToPortfolio,
    getBrokerName,
    getStatusLabel,
  };
}
