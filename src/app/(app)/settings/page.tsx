"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Bot,
  Brain,
  Check,
  CreditCard,
  Key,
  Loader2,
  LogOut,
  MessageSquare,
  Server,
  Shield,
  Sparkles,
  Trash2,
  User,
  Users,
  Zap,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSettings, LLMProvider, PROVIDER_INFO } from "@/hooks/use-settings";
import { useNotificationsAPI, NotificationPreferences } from "@/hooks/use-notifications";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "Gratis",
    features: ["Carteira com ate 10 ativos", "Analises basicas", "Chat IA (50 msgs/mes)"],
  },
  {
    id: "smart",
    name: "Smart",
    price: "R$ 29,90/mes",
    features: ["Carteira ilimitada", "Analises avancadas", "Chat IA ilimitado", "Rebalanceamento"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 79,90/mes",
    features: ["Tudo do Smart", "Backtesting", "API access", "Suporte prioritario"],
  },
];

// Icon map for providers
const ProviderIcon = ({ provider }: { provider: LLMProvider }) => {
  const iconClass = "h-5 w-5";
  switch (provider) {
    case "auto":
      return <Sparkles className={iconClass} />;
    case "ollama":
      return <Server className={iconClass} />;
    case "deepseek":
      return <Brain className={iconClass} />;
    case "groq":
      return <Zap className={iconClass} />;
    case "together":
      return <Users className={iconClass} />;
    case "openai":
      return <Bot className={iconClass} />;
    case "anthropic":
      return <MessageSquare className={iconClass} />;
    default:
      return <Bot className={iconClass} />;
  }
};

export default function SettingsPage() {
  const { user, logout, setUser } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Profile form state
  const [profileName, setProfileName] = useState(user?.full_name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  // LLM Settings
  const {
    settings,
    providers,
    isLoading: isSettingsLoading,
    isTesting,
    fetchSettings,
    fetchProviders,
    updateLLMSettings,
    saveAPIKey,
    deleteAPIKey,
    testConnection,
    hasAPIKey,
  } = useSettings();

  // Notification Settings
  const {
    isLoading: isNotifLoading,
    preferences: notifPreferences,
    fetchPreferences,
    updatePreferences,
  } = useNotificationsAPI();

  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>("auto");
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyProvider, setApiKeyProvider] = useState<LLMProvider | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteProvider, setDeleteProvider] = useState<LLMProvider | null>(null);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
    fetchProviders();
    fetchPreferences();
  }, [fetchSettings, fetchProviders, fetchPreferences]);

  // Update selected provider when settings load
  useEffect(() => {
    if (settings) {
      setSelectedProvider(settings.llm_provider);
    }
  }, [settings]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome e obrigatorio.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.patch("/profile/", {
        full_name: profileName.trim(),
        phone: profilePhone.trim() || null,
      });

      // Update local user state
      if (user && setUser) {
        setUser({
          ...user,
          full_name: response.data.full_name,
          phone: response.data.phone,
        });
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informacoes foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = async (provider: LLMProvider) => {
    setSelectedProvider(provider);
    await updateLLMSettings({ llm_provider: provider });
  };

  const handleOpenApiKeyDialog = (provider: LLMProvider) => {
    setApiKeyProvider(provider);
    setApiKeyInput("");
    setApiKeyDialogOpen(true);
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyProvider || !apiKeyInput) return;
    const success = await saveAPIKey(apiKeyProvider, apiKeyInput);
    if (success) {
      setApiKeyDialogOpen(false);
      setApiKeyInput("");
      setApiKeyProvider(null);
    }
  };

  const handleOpenDeleteConfirm = (provider: LLMProvider) => {
    setDeleteProvider(provider);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteApiKey = async () => {
    if (!deleteProvider) return;
    const success = await deleteAPIKey(deleteProvider);
    if (success) {
      setDeleteConfirmOpen(false);
      setDeleteProvider(null);
    }
  };

  const handleTestConnection = async (provider: LLMProvider) => {
    await testConnection(provider);
  };

  // Providers that require API keys
  const apiProviders: LLMProvider[] = ["openai", "anthropic", "deepseek", "groq", "together"];

  return (
    <div className="flex flex-col">
      <Header
        title="Configuracoes"
        description="Gerencie sua conta e preferencias"
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>
              Suas informacoes pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/onboarding/profile-assessment">
                  <Shield className="mr-2 h-4 w-4" />
                  Atualizar perfil de investidor
                </Link>
              </Button>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar alteracoes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI/LLM Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Configuracoes de IA
            </CardTitle>
            <CardDescription>
              Escolha seu provedor de IA preferido para o assistente de investimentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <Label>Provedor de IA</Label>
              <Select
                value={selectedProvider}
                onValueChange={(value) => handleProviderChange(value as LLMProvider)}
                disabled={isSettingsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Automatico</span>
                      <Badge variant="secondary" className="ml-2">Recomendado</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="ollama">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      <span>Ollama (Local)</span>
                      <Badge variant="outline" className="ml-2">Gratuito</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="deepseek">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span>DeepSeek</span>
                      <Badge variant="outline" className="ml-2">Acessivel</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="groq">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Groq</span>
                      <Badge variant="outline" className="ml-2">Rapido</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="together">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Together AI</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span>OpenAI (GPT-4)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="anthropic">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Anthropic (Claude)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {PROVIDER_INFO[selectedProvider]?.description}
              </p>
            </div>

            {/* API Keys Management */}
            <div className="space-y-3">
              <Label>Suas Chaves API</Label>
              <p className="text-sm text-muted-foreground">
                Configure suas proprias chaves API para usar provedores pagos
              </p>
              <div className="grid gap-3">
                {apiProviders.map((provider) => (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderIcon provider={provider} />
                      <div>
                        <p className="font-medium">{PROVIDER_INFO[provider].name}</p>
                        <p className="text-sm text-muted-foreground">
                          {hasAPIKey(provider) ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="h-3 w-3" />
                              Configurada
                            </span>
                          ) : (
                            "Nao configurada"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAPIKey(provider) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(provider)}
                            disabled={isTesting}
                          >
                            {isTesting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Testar"
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteConfirm(provider)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant={hasAPIKey(provider) ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleOpenApiKeyDialog(provider)}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        {hasAPIKey(provider) ? "Atualizar" : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Status */}
            {providers?.active_provider && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm">
                  <span className="font-medium">Provedor ativo: </span>
                  {PROVIDER_INFO[providers.active_provider as LLMProvider]?.name || providers.active_provider}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Assinatura
            </CardTitle>
            <CardDescription>
              Seu plano atual: <span className="font-semibold capitalize">{user?.subscription_plan || "Starter"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 ${
                    user?.subscription_plan === plan.id
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-lg font-bold text-primary">{plan.price}</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                  {user?.subscription_plan !== plan.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                    >
                      {plan.id === "starter" ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                  {user?.subscription_plan === plan.id && (
                    <div className="mt-4 text-center text-sm text-primary font-medium">
                      Plano atual
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificacoes
            </CardTitle>
            <CardDescription>
              Configure como deseja receber atualizacoes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notificacoes por Email</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de preco</p>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas quando precos atingirem seus alvos
                  </p>
                </div>
                <Checkbox
                  checked={notifPreferences?.email?.price_alerts ?? true}
                  onCheckedChange={(checked) =>
                    updatePreferences({ email_price_alerts: !!checked })
                  }
                  disabled={isNotifLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Atualizacoes da carteira</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificacoes sobre mudancas na sua carteira
                  </p>
                </div>
                <Checkbox
                  checked={notifPreferences?.email?.portfolio_updates ?? true}
                  onCheckedChange={(checked) =>
                    updatePreferences({ email_portfolio_updates: !!checked })
                  }
                  disabled={isNotifLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recomendacoes</p>
                  <p className="text-sm text-muted-foreground">
                    Receba recomendacoes personalizadas da IA
                  </p>
                </div>
                <Checkbox
                  checked={notifPreferences?.email?.recommendations ?? true}
                  onCheckedChange={(checked) =>
                    updatePreferences({ email_recommendations: !!checked })
                  }
                  disabled={isNotifLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Resumo semanal</p>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo semanal da sua carteira
                  </p>
                </div>
                <Checkbox
                  checked={notifPreferences?.email?.weekly_report ?? true}
                  onCheckedChange={(checked) =>
                    updatePreferences({ email_weekly_report: !!checked })
                  }
                  disabled={isNotifLoading}
                />
              </div>
            </div>

            {/* Push Notifications */}
            <div className="space-y-4 border-t pt-6">
              <h4 className="text-sm font-medium">Notificacoes Push</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de preco</p>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas em tempo real no navegador
                  </p>
                </div>
                <Checkbox
                  checked={notifPreferences?.push?.price_alerts ?? false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ push_price_alerts: !!checked })
                  }
                  disabled={isNotifLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Atualizacoes da carteira</p>
                  <p className="text-sm text-muted-foreground">
                    Notificacoes push sobre sua carteira
                  </p>
                </div>
                <Checkbox
                  checked={notifPreferences?.push?.portfolio_updates ?? false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ push_portfolio_updates: !!checked })
                  }
                  disabled={isNotifLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recomendacoes</p>
                  <p className="text-sm text-muted-foreground">
                    Notificacoes push de recomendacoes
                  </p>
                </div>
                <Checkbox
                  checked={notifPreferences?.push?.recommendations ?? false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ push_recommendations: !!checked })
                  }
                  disabled={isNotifLoading}
                />
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Horario de silencio</p>
                  <p className="text-sm text-muted-foreground">
                    Nao receber notificacoes push durante determinado horario
                  </p>
                </div>
                <Checkbox
                  checked={notifPreferences?.quiet_hours?.enabled ?? false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ quiet_hours_enabled: !!checked })
                  }
                  disabled={isNotifLoading}
                />
              </div>
              {notifPreferences?.quiet_hours?.enabled && (
                <div className="flex items-center gap-4 pl-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quiet-start" className="text-sm">De:</Label>
                    <Select
                      value={String(notifPreferences?.quiet_hours?.start ?? 22)}
                      onValueChange={(v) => updatePreferences({ quiet_hours_start: parseInt(v) })}
                      disabled={isNotifLoading}
                    >
                      <SelectTrigger id="quiet-start" className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quiet-end" className="text-sm">Ate:</Label>
                    <Select
                      value={String(notifPreferences?.quiet_hours?.end ?? 8)}
                      onValueChange={(v) => updatePreferences({ quiet_hours_end: parseInt(v) })}
                      disabled={isNotifLoading}
                    >
                      <SelectTrigger id="quiet-end" className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Seguranca
            </CardTitle>
            <CardDescription>
              Gerencie a seguranca da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Alterar senha</Button>
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair da conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {apiKeyProvider && <ProviderIcon provider={apiKeyProvider} />}
              Configurar {apiKeyProvider && PROVIDER_INFO[apiKeyProvider]?.name}
            </DialogTitle>
            <DialogDescription>
              Insira sua chave API para usar este provedor. Sua chave sera armazenada de forma segura.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Chave API</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {apiKeyProvider === "openai" && (
                <>Obtenha sua chave em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a></>
              )}
              {apiKeyProvider === "anthropic" && (
                <>Obtenha sua chave em <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.anthropic.com</a></>
              )}
              {apiKeyProvider === "deepseek" && (
                <>Obtenha sua chave em <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.deepseek.com</a></>
              )}
              {apiKeyProvider === "groq" && (
                <>Obtenha sua chave em <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.groq.com</a></>
              )}
              {apiKeyProvider === "together" && (
                <>Obtenha sua chave em <a href="https://api.together.xyz/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">api.together.xyz</a></>
              )}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveApiKey} disabled={!apiKeyInput || isSettingsLoading}>
              {isSettingsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover chave API</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover a chave API do {deleteProvider && PROVIDER_INFO[deleteProvider]?.name}?
              Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteApiKey} disabled={isSettingsLoading}>
              {isSettingsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
