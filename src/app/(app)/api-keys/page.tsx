"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Copy,
  Key,
  Loader2,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Activity,
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogTrigger,
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
import { usePublicAPI, APIKey, APIKeyPermission } from "@/hooks/use-public-api";

// Permission icons
const permissionIcons: Record<APIKeyPermission, React.ReactNode> = {
  read_only: <Shield className="h-4 w-4" />,
  read_write: <ShieldAlert className="h-4 w-4" />,
  full_access: <ShieldCheck className="h-4 w-4" />,
};

const permissionColors: Record<APIKeyPermission, string> = {
  read_only: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  read_write: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  full_access: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function APIKeysPage() {
  const {
    isLoading,
    apiKeys,
    newlyCreatedKey,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    clearNewKey,
    getPermissionLabel,
  } = usePublicAPI();

  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permission, setPermission] = useState<APIKeyPermission>("read_only");
  const [ratePerMinute, setRatePerMinute] = useState("60");
  const [ratePerDay, setRatePerDay] = useState("10000");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [isTestMode, setIsTestMode] = useState(false);

  // Copy state
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Fetch keys on mount
  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  // Handle create
  const handleCreate = async () => {
    const result = await createApiKey({
      name,
      description: description || undefined,
      permission,
      rate_limit_per_minute: parseInt(ratePerMinute),
      rate_limit_per_day: parseInt(ratePerDay),
      expires_in_days: expiresInDays ? parseInt(expiresInDays) : undefined,
      is_test_mode: isTestMode,
    });

    if (result) {
      setShowCreateDialog(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPermission("read_only");
    setRatePerMinute("60");
    setRatePerDay("10000");
    setExpiresInDays("");
    setIsTestMode(false);
  };

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Chaves API"
        description="Gerencie suas chaves de acesso a API publica"
      />

      <div className="p-6 space-y-6">
        {/* New Key Alert */}
        {newlyCreatedKey && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Key className="h-5 w-5" />
                Nova Chave Criada
              </CardTitle>
              <CardDescription>
                Copie sua chave agora. Por seguranca, ela nao sera mostrada novamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    value={newlyCreatedKey.raw_key}
                    readOnly
                    className="pr-20 font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-10 top-0 h-full"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => copyToClipboard(newlyCreatedKey.raw_key)}
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="outline" onClick={clearNewKey}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Suas Chaves</h2>
            <p className="text-sm text-muted-foreground">
              {apiKeys.length} chave{apiKeys.length !== 1 ? "s" : ""} cadastrada{apiKeys.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Chave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Chave API</DialogTitle>
                <DialogDescription>
                  Configure as permissoes e limites da sua nova chave.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    placeholder="Ex: Integracao App Mobile"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descricao</Label>
                  <Input
                    placeholder="Descricao opcional"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permissao</Label>
                  <Select value={permission} onValueChange={(v) => setPermission(v as APIKeyPermission)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read_only">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          Somente Leitura
                        </div>
                      </SelectItem>
                      <SelectItem value="read_write">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-yellow-500" />
                          Leitura e Escrita
                        </div>
                      </SelectItem>
                      <SelectItem value="full_access">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-red-500" />
                          Acesso Total
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Limite/minuto</Label>
                    <Input
                      type="number"
                      value={ratePerMinute}
                      onChange={(e) => setRatePerMinute(e.target.value)}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limite/dia</Label>
                    <Input
                      type="number"
                      value={ratePerDay}
                      onChange={(e) => setRatePerDay(e.target.value)}
                      min="1"
                      max="100000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expira em (dias)</Label>
                  <Input
                    type="number"
                    placeholder="Deixe vazio para nao expirar"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    min="1"
                    max="365"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Teste</Label>
                    <p className="text-xs text-muted-foreground">
                      Chave para ambiente de desenvolvimento
                    </p>
                  </div>
                  <Switch checked={isTestMode} onCheckedChange={setIsTestMode} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={isLoading || !name}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Chave
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Keys List */}
        {isLoading && apiKeys.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : apiKeys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma chave API criada</p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar sua primeira chave
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <Card key={key.id} className={!key.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{key.name}</h3>
                        {key.is_test_mode && (
                          <Badge variant="outline">Teste</Badge>
                        )}
                        {!key.is_active && (
                          <Badge variant="destructive">Revogada</Badge>
                        )}
                      </div>
                      {key.description && (
                        <p className="text-sm text-muted-foreground">{key.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <code className="bg-muted px-2 py-1 rounded font-mono">
                          {key.key_prefix}...
                        </code>
                        <Badge className={permissionColors[key.permission]}>
                          {permissionIcons[key.permission]}
                          <span className="ml-1">{getPermissionLabel(key.permission)}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {key.total_requests.toLocaleString()} requests
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Ultimo uso: {formatDate(key.last_used_at)}
                        </span>
                        {key.expires_at && (
                          <span className="flex items-center gap-1">
                            Expira: {formatDate(key.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    {key.is_active && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revogar chave API?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acao nao pode ser desfeita. A chave sera desativada imediatamente
                              e todas as integracoes que a utilizam pararam de funcionar.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => revokeApiKey(key.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Revogar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentacao da API</CardTitle>
            <CardDescription>
              Aprenda como usar sua chave API para integracoes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Autenticacao</h4>
              <p className="text-sm text-muted-foreground">
                Adicione o header <code className="bg-muted px-1 rounded">X-API-Key</code> em todas as requisicoes:
              </p>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`curl -H "X-API-Key: sua_chave_aqui" \\
  https://api.zenith.com.br/api/v1/public/v1/portfolio`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Endpoints Disponiveis</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">GET /api/v1/public/v1/portfolio</code> - Obter carteira</li>
                <li><code className="bg-muted px-1 rounded">GET /api/v1/public/v1/market/quote/:ticker</code> - Cotacao de ativo</li>
                <li><code className="bg-muted px-1 rounded">GET /api/v1/public/v1/market/history/:ticker</code> - Historico de precos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
