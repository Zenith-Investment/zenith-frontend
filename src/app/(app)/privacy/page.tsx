"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  Download,
  Eye,
  EyeOff,
  FileDown,
  Loader2,
  Lock,
  Shield,
  ShieldAlert,
  Trash2,
  Users,
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
import { Textarea } from "@/components/ui/textarea";
import { usePrivacy, PrivacySettings } from "@/hooks/use-privacy";

export default function PrivacyPage() {
  const {
    isLoading,
    dataExports,
    privacySettings,
    deletionRequest,
    fetchPrivacySettings,
    updatePrivacySettings,
    requestDataExport,
    fetchDataExports,
    downloadExport,
    requestAccountDeletion,
    cancelAccountDeletion,
    fetchDeletionStatus,
    getVisibilityLabel,
  } = usePrivacy();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [localSettings, setLocalSettings] = useState<PrivacySettings | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchPrivacySettings();
    fetchDataExports();
    fetchDeletionStatus();
  }, [fetchPrivacySettings, fetchDataExports, fetchDeletionStatus]);

  // Sync local settings with fetched settings
  useEffect(() => {
    if (privacySettings) {
      setLocalSettings(privacySettings);
    }
  }, [privacySettings]);

  // Handle setting change
  const handleSettingChange = async <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    if (!localSettings) return;

    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    await updatePrivacySettings({ [key]: value });
  };

  // Handle delete request
  const handleDeleteRequest = async () => {
    await requestAccountDeletion(deleteReason || undefined);
    setShowDeleteDialog(false);
    setDeleteReason("");
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export status colors
  const exportStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Privacidade e LGPD"
        description="Gerencie seus dados e preferencias de privacidade"
      />

      <div className="p-6 space-y-6">
        {/* Deletion Alert */}
        {deletionRequest && deletionRequest.status === "scheduled" && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="flex items-start gap-4 p-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900 dark:text-red-100">
                  Exclusao de Conta Agendada
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Sua conta sera excluida em {formatDate(deletionRequest.scheduled_for)}.
                  Todos os seus dados serao removidos permanentemente.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={cancelAccountDeletion}
                  disabled={isLoading}
                >
                  Cancelar Exclusao
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuracoes de Privacidade
            </CardTitle>
            <CardDescription>
              Controle como seus dados sao coletados e utilizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {localSettings ? (
              <>
                {/* Analytics Consent */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Coleta de Analytics</Label>
                    <p className="text-xs text-muted-foreground">
                      Permitir coleta de dados anonimos para melhorar a plataforma
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.analytics_consent}
                    onCheckedChange={(v) => handleSettingChange("analytics_consent", v)}
                    disabled={isLoading}
                  />
                </div>

                {/* Marketing Consent */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Comunicacoes de Marketing</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber emails sobre novidades e promocoes
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.marketing_consent}
                    onCheckedChange={(v) => handleSettingChange("marketing_consent", v)}
                    disabled={isLoading}
                  />
                </div>

                {/* Third Party Sharing */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compartilhamento com Terceiros</Label>
                    <p className="text-xs text-muted-foreground">
                      Permitir compartilhamento de dados com parceiros
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.third_party_sharing}
                    onCheckedChange={(v) => handleSettingChange("third_party_sharing", v)}
                    disabled={isLoading}
                  />
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Visibilidade do Perfil</h4>

                  {/* Profile Visibility */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Quem pode ver seu perfil</Label>
                        <p className="text-xs text-muted-foreground">
                          Controle a visibilidade do seu perfil na comunidade
                        </p>
                      </div>
                      <Select
                        value={localSettings.profile_visibility}
                        onValueChange={(v) =>
                          handleSettingChange(
                            "profile_visibility",
                            v as PrivacySettings["profile_visibility"]
                          )
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Publico
                            </div>
                          </SelectItem>
                          <SelectItem value="connections_only">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Apenas Conexoes
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <EyeOff className="h-4 w-4" />
                              Privado
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Show Portfolio Value */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mostrar valor da carteira</Label>
                        <p className="text-xs text-muted-foreground">
                          Exibir o valor total do portfolio na comunidade
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.show_portfolio_value}
                        onCheckedChange={(v) => handleSettingChange("show_portfolio_value", v)}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Show Activity */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mostrar atividade</Label>
                        <p className="text-xs text-muted-foreground">
                          Exibir suas transacoes e atividades recentes
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.show_activity}
                        onCheckedChange={(v) => handleSettingChange("show_activity", v)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Export - LGPD Right to Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Exportar Meus Dados
            </CardTitle>
            <CardDescription>
              Direito de acesso aos seus dados pessoais (LGPD Art. 18)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Voce pode solicitar uma copia de todos os dados que armazenamos sobre voce.
              O arquivo sera disponibilizado em ate 15 dias uteis.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => requestDataExport("json")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Exportar JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => requestDataExport("csv")}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {/* Export History */}
            {dataExports.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Solicitacoes Anteriores</h4>
                <div className="space-y-2">
                  {dataExports.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={exportStatusColors[exp.status]}>
                          {exp.status === "completed" && <Check className="h-3 w-3 mr-1" />}
                          {exp.status === "processing" && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {exp.status}
                        </Badge>
                        <span className="text-sm">
                          {exp.format.toUpperCase()} - {formatDate(exp.requested_at)}
                        </span>
                      </div>
                      {exp.status === "completed" && exp.download_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadExport(exp.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Deletion - LGPD Right to Deletion */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Excluir Minha Conta
            </CardTitle>
            <CardDescription>
              Direito a eliminacao dos dados pessoais (LGPD Art. 18)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 dark:text-red-100 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Atencao: Esta acao e irreversivel
              </h4>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>Todos os seus dados serao permanentemente excluidos</li>
                <li>Suas carteiras, transacoes e historico serao removidos</li>
                <li>Voce perdera acesso a todas as funcionalidades</li>
                <li>Dados exigidos por lei serao mantidos pelo prazo legal</li>
              </ul>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isLoading || deletionRequest?.status === "scheduled"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deletionRequest?.status === "scheduled"
                    ? "Exclusao ja solicitada"
                    : "Solicitar Exclusao"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusao de Conta</DialogTitle>
                  <DialogDescription>
                    Sua conta sera agendada para exclusao em 30 dias.
                    Voce pode cancelar a qualquer momento neste periodo.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Motivo da exclusao (opcional)</Label>
                    <Textarea
                      placeholder="Conte-nos por que voce esta saindo..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancelar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Confirmar Exclusao
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acao ira agendar a exclusao permanente da sua conta
                          e todos os dados associados. Voce tera 30 dias para cancelar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteRequest}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sim, excluir minha conta
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* LGPD Info */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="flex items-start gap-4 p-4">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Seus Direitos sob a LGPD
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                A Lei Geral de Protecao de Dados (Lei 13.709/2018) garante a voce direitos
                sobre seus dados pessoais, incluindo acesso, correcao, anonimizacao,
                portabilidade e eliminacao. Para exercer qualquer direito nao disponivel
                nesta pagina, entre em contato com nosso DPO em{" "}
                <a href="mailto:privacidade@zenith.com.br" className="underline">
                  privacidade@zenith.com.br
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
