"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
export type APIKeyPermission = "read_only" | "read_write" | "full_access";

export interface APIKey {
  id: number;
  name: string;
  description: string | null;
  key_prefix: string;
  permission: APIKeyPermission;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  is_active: boolean;
  is_test_mode: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  total_requests: number;
  created_at: string;
}

export interface NewAPIKey extends APIKey {
  raw_key: string;
}

export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  permission?: APIKeyPermission;
  rate_limit_per_minute?: number;
  rate_limit_per_day?: number;
  allowed_ips?: string[];
  expires_in_days?: number;
  is_test_mode?: boolean;
}

export interface APIKeyStats {
  total_requests: number;
  requests_today: number;
  requests_this_month: number;
  rate_limit_remaining: number;
  last_used_at: string | null;
  usage_by_endpoint: Record<string, number>;
}

export function usePublicAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<NewAPIKey | null>(null);
  const { toast } = useToast();

  // Fetch all API keys
  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ keys: APIKey[]; total: number }>("/public/keys");
      setApiKeys(response.data.keys);
      return response.data.keys;
    } catch (error) {
      toast({
        title: "Erro ao carregar chaves API",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create new API key
  const createApiKey = useCallback(
    async (request: CreateAPIKeyRequest) => {
      try {
        setIsLoading(true);
        const response = await api.post<NewAPIKey>("/public/keys", request);
        setNewlyCreatedKey(response.data);
        await fetchApiKeys();
        toast({
          title: "Chave API criada",
          description: "Copie sua chave agora, ela nao sera mostrada novamente.",
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao criar chave",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, fetchApiKeys]
  );

  // Revoke API key
  const revokeApiKey = useCallback(
    async (keyId: number) => {
      try {
        setIsLoading(true);
        await api.delete(`/public/keys/${keyId}`);
        setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
        toast({
          title: "Chave revogada",
          description: "A chave API foi revogada com sucesso.",
        });
        return true;
      } catch (error) {
        toast({
          title: "Erro ao revogar",
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

  // Get key stats
  const getKeyStats = useCallback(
    async (keyId: number) => {
      try {
        setIsLoading(true);
        const response = await api.get<APIKeyStats>(`/public/keys/${keyId}/stats`);
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao carregar estatisticas",
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

  // Clear newly created key
  const clearNewKey = useCallback(() => {
    setNewlyCreatedKey(null);
  }, []);

  // Get permission label
  const getPermissionLabel = (permission: APIKeyPermission): string => {
    const labels: Record<APIKeyPermission, string> = {
      read_only: "Somente Leitura",
      read_write: "Leitura e Escrita",
      full_access: "Acesso Total",
    };
    return labels[permission] || permission;
  };

  return {
    isLoading,
    apiKeys,
    newlyCreatedKey,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    getKeyStats,
    clearNewKey,
    getPermissionLabel,
  };
}
