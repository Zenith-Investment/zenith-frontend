"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
export interface DataExportRequest {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  format: "json" | "csv";
  requested_at: string;
  completed_at: string | null;
  download_url: string | null;
  expires_at: string | null;
}

export interface ConsentRecord {
  id: number;
  consent_type: string;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  ip_address: string | null;
}

export interface PrivacySettings {
  analytics_consent: boolean;
  marketing_consent: boolean;
  third_party_sharing: boolean;
  profile_visibility: "public" | "private" | "connections_only";
  show_portfolio_value: boolean;
  show_activity: boolean;
}

export interface AccountDeletionRequest {
  id: number;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  reason: string | null;
  scheduled_for: string | null;
  requested_at: string;
}

export function usePrivacy() {
  const [isLoading, setIsLoading] = useState(false);
  const [dataExports, setDataExports] = useState<DataExportRequest[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const { toast } = useToast();

  // Fetch privacy settings
  const fetchPrivacySettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<PrivacySettings>("/privacy/settings");
      setPrivacySettings(response.data);
      return response.data;
    } catch (error) {
      toast({
        title: "Erro ao carregar configuracoes",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(
    async (settings: Partial<PrivacySettings>) => {
      try {
        setIsLoading(true);
        const response = await api.patch<PrivacySettings>("/privacy/settings", settings);
        setPrivacySettings(response.data);
        toast({
          title: "Configuracoes atualizadas",
          description: "Suas preferencias de privacidade foram salvas.",
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao atualizar",
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

  // Fetch consent records
  const fetchConsents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ consents: ConsentRecord[] }>("/privacy/consents");
      setConsents(response.data.consents);
      return response.data.consents;
    } catch (error) {
      toast({
        title: "Erro ao carregar consentimentos",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update consent
  const updateConsent = useCallback(
    async (consentType: string, granted: boolean) => {
      try {
        setIsLoading(true);
        await api.post("/privacy/consents", { consent_type: consentType, granted });
        await fetchConsents();
        toast({
          title: granted ? "Consentimento concedido" : "Consentimento revogado",
          description: `Seu consentimento foi ${granted ? "concedido" : "revogado"} com sucesso.`,
        });
        return true;
      } catch (error) {
        toast({
          title: "Erro ao atualizar consentimento",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, fetchConsents]
  );

  // Request data export
  const requestDataExport = useCallback(
    async (format: "json" | "csv" = "json") => {
      try {
        setIsLoading(true);
        const response = await api.post<DataExportRequest>("/privacy/export", { format });
        setDataExports((prev) => [response.data, ...prev]);
        toast({
          title: "Exportacao solicitada",
          description: "Voce sera notificado quando seus dados estiverem prontos para download.",
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao solicitar exportacao",
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

  // Fetch data exports
  const fetchDataExports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ exports: DataExportRequest[] }>("/privacy/exports");
      setDataExports(response.data.exports);
      return response.data.exports;
    } catch (error) {
      toast({
        title: "Erro ao carregar exportacoes",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Download data export
  const downloadExport = useCallback(
    async (exportId: number) => {
      try {
        const response = await api.get(`/privacy/exports/${exportId}/download`, {
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `dados_zenith_${exportId}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
      } catch (error) {
        toast({
          title: "Erro ao baixar",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  // Request account deletion
  const requestAccountDeletion = useCallback(
    async (reason?: string) => {
      try {
        setIsLoading(true);
        const response = await api.post<AccountDeletionRequest>("/privacy/delete-account", {
          reason,
        });
        setDeletionRequest(response.data);
        toast({
          title: "Solicitacao registrada",
          description: "Sua conta sera excluida em 30 dias. Voce pode cancelar a qualquer momento.",
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao solicitar exclusao",
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

  // Cancel account deletion
  const cancelAccountDeletion = useCallback(async () => {
    try {
      setIsLoading(true);
      await api.delete("/privacy/delete-account");
      setDeletionRequest(null);
      toast({
        title: "Solicitacao cancelada",
        description: "A exclusao da sua conta foi cancelada.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch deletion request status
  const fetchDeletionStatus = useCallback(async () => {
    try {
      const response = await api.get<AccountDeletionRequest | null>("/privacy/delete-account/status");
      setDeletionRequest(response.data);
      return response.data;
    } catch {
      // No deletion request exists
      setDeletionRequest(null);
      return null;
    }
  }, []);

  // Get consent type label
  const getConsentLabel = (consentType: string): string => {
    const labels: Record<string, string> = {
      analytics: "Coleta de Analytics",
      marketing: "Comunicacoes de Marketing",
      third_party: "Compartilhamento com Terceiros",
      cookies: "Cookies Nao Essenciais",
      personalization: "Personalizacao de Conteudo",
    };
    return labels[consentType] || consentType;
  };

  // Get visibility label
  const getVisibilityLabel = (visibility: PrivacySettings["profile_visibility"]): string => {
    const labels: Record<PrivacySettings["profile_visibility"], string> = {
      public: "Publico",
      private: "Privado",
      connections_only: "Apenas Conexoes",
    };
    return labels[visibility] || visibility;
  };

  return {
    isLoading,
    dataExports,
    consents,
    privacySettings,
    deletionRequest,
    fetchPrivacySettings,
    updatePrivacySettings,
    fetchConsents,
    updateConsent,
    requestDataExport,
    fetchDataExports,
    downloadExport,
    requestAccountDeletion,
    cancelAccountDeletion,
    fetchDeletionStatus,
    getConsentLabel,
    getVisibilityLabel,
  };
}
