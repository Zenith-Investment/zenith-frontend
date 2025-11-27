"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
export type LLMProvider = "ollama" | "openai" | "anthropic" | "deepseek" | "groq" | "together" | "auto";

export interface LLMModelInfo {
  id: string;
  name: string;
  description: string;
}

export interface LLMProviderInfo {
  enabled: boolean;
  model: string | null;
  type: "local" | "api";
  cost: "free" | "low" | "paid" | "free_tier";
  user_key_configured: boolean;
}

export interface UserSettings {
  id: number;
  user_id: number;
  llm_provider: LLMProvider;
  llm_model: string | null;
  has_openai_key: boolean;
  has_anthropic_key: boolean;
  has_deepseek_key: boolean;
  has_groq_key: boolean;
  has_together_key: boolean;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string | null;
}

export interface AvailableProvidersResponse {
  active_provider: string | null;
  available_providers: Record<string, LLMProviderInfo>;
  available_models: Record<string, LLMModelInfo[]>;
}

export interface TestConnectionResult {
  success: boolean;
  provider: string;
  model: string;
  message: string;
  response_time_ms?: number;
}

// Provider display info
export const PROVIDER_INFO: Record<LLMProvider, { name: string; description: string; icon: string }> = {
  auto: {
    name: "Automatico",
    description: "Sistema escolhe o melhor provedor disponivel",
    icon: "Sparkles",
  },
  ollama: {
    name: "Ollama (Local)",
    description: "Gratuito, privado, roda na sua maquina",
    icon: "Server",
  },
  deepseek: {
    name: "DeepSeek",
    description: "API acessivel (~$0.14/1M tokens)",
    icon: "Brain",
  },
  groq: {
    name: "Groq",
    description: "Inferencia rapida, tier gratuito",
    icon: "Zap",
  },
  together: {
    name: "Together AI",
    description: "Ampla selecao de modelos",
    icon: "Users",
  },
  openai: {
    name: "OpenAI",
    description: "GPT-4o, GPT-4-turbo (sua chave)",
    icon: "Bot",
  },
  anthropic: {
    name: "Anthropic",
    description: "Claude Sonnet 4.5 (sua chave)",
    icon: "MessageSquare",
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [providers, setProviders] = useState<AvailableProvidersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<UserSettings>("/settings/");
      setSettings(response.data);
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

  // Fetch available providers
  const fetchProviders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<AvailableProvidersResponse>("/settings/llm/providers");
      setProviders(response.data);
      return response.data;
    } catch (error) {
      toast({
        title: "Erro ao carregar provedores",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update LLM settings
  const updateLLMSettings = useCallback(
    async (data: { llm_provider?: LLMProvider; llm_model?: string }) => {
      try {
        setIsLoading(true);
        const response = await api.put<UserSettings>("/settings/llm", data);
        setSettings(response.data);
        toast({
          title: "Configuracoes atualizadas",
          description: "Suas preferencias de IA foram salvas.",
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao atualizar configuracoes",
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

  // Save API key
  const saveAPIKey = useCallback(
    async (provider: LLMProvider, apiKey: string) => {
      try {
        setIsLoading(true);
        await api.post("/settings/llm/api-key", {
          provider,
          api_key: apiKey,
        });
        // Refresh settings to update has_*_key flags
        await fetchSettings();
        toast({
          title: "Chave API salva",
          description: `Sua chave ${PROVIDER_INFO[provider].name} foi salva com sucesso.`,
        });
        return true;
      } catch (error) {
        toast({
          title: "Erro ao salvar chave API",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, fetchSettings]
  );

  // Delete API key
  const deleteAPIKey = useCallback(
    async (provider: LLMProvider) => {
      try {
        setIsLoading(true);
        await api.delete("/settings/llm/api-key", {
          data: { provider },
        });
        // Refresh settings
        await fetchSettings();
        toast({
          title: "Chave API removida",
          description: `Sua chave ${PROVIDER_INFO[provider].name} foi removida.`,
        });
        return true;
      } catch (error) {
        toast({
          title: "Erro ao remover chave API",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, fetchSettings]
  );

  // Test connection
  const testConnection = useCallback(
    async (provider: LLMProvider, apiKey?: string): Promise<TestConnectionResult | null> => {
      try {
        setIsTesting(true);
        const response = await api.post<TestConnectionResult>("/settings/llm/test", {
          provider,
          api_key: apiKey,
        });

        if (response.data.success) {
          toast({
            title: "Conexao bem sucedida!",
            description: `${PROVIDER_INFO[provider].name}: ${response.data.response_time_ms}ms`,
          });
        } else {
          toast({
            title: "Falha na conexao",
            description: response.data.message,
            variant: "destructive",
          });
        }

        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao testar conexao",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return null;
      } finally {
        setIsTesting(false);
      }
    },
    [toast]
  );

  // Update UI settings
  const updateUISettings = useCallback(
    async (data: { theme?: string; language?: string }) => {
      try {
        setIsLoading(true);
        const response = await api.put<UserSettings>("/settings/ui", data);
        setSettings(response.data);
        toast({
          title: "Preferencias atualizadas",
          description: "Suas configuracoes de interface foram salvas.",
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao atualizar preferencias",
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

  // Check if provider has API key configured
  const hasAPIKey = useCallback(
    (provider: LLMProvider): boolean => {
      if (!settings) return false;
      switch (provider) {
        case "openai":
          return settings.has_openai_key;
        case "anthropic":
          return settings.has_anthropic_key;
        case "deepseek":
          return settings.has_deepseek_key;
        case "groq":
          return settings.has_groq_key;
        case "together":
          return settings.has_together_key;
        default:
          return false;
      }
    },
    [settings]
  );

  return {
    settings,
    providers,
    isLoading,
    isTesting,
    fetchSettings,
    fetchProviders,
    updateLLMSettings,
    saveAPIKey,
    deleteAPIKey,
    testConnection,
    updateUISettings,
    hasAPIKey,
  };
}
