"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useAlerts,
  useCreateAlert,
  useUpdateAlert,
  useDeleteAlert,
  PriceAlert,
  AlertCondition,
} from "@/hooks/use-alerts";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function CreateAlertDialog() {
  const [open, setOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<AlertCondition>("above");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ ticker?: string; price?: string }>({});

  const createMutation = useCreateAlert();

  const validateForm = (): boolean => {
    const newErrors: { ticker?: string; price?: string } = {};

    // Validate ticker (letters and numbers, 4-6 chars)
    const tickerRegex = /^[A-Za-z]{4}[0-9]{1,2}$/;
    if (!ticker.trim()) {
      newErrors.ticker = "Ticker e obrigatorio";
    } else if (!tickerRegex.test(ticker.trim())) {
      newErrors.ticker = "Formato invalido (ex: PETR4, VALE3)";
    }

    // Validate price
    const price = parseFloat(targetPrice);
    if (!targetPrice || isNaN(price)) {
      newErrors.price = "Preco e obrigatorio";
    } else if (price <= 0) {
      newErrors.price = "Preco deve ser maior que zero";
    } else if (price > 1000000) {
      newErrors.price = "Preco muito alto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    createMutation.mutate(
      {
        ticker: ticker.toUpperCase().trim(),
        target_price: parseFloat(targetPrice),
        condition,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTicker("");
          setTargetPrice("");
          setCondition("above");
          setNotes("");
          setErrors({});
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Alerta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Alerta de Preco</DialogTitle>
          <DialogDescription>
            Configure um alerta para ser notificado quando o preco atingir o valor desejado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                placeholder="Ex: PETR4"
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value.toUpperCase());
                  if (errors.ticker) setErrors((prev) => ({ ...prev, ticker: undefined }));
                }}
                className={errors.ticker ? "border-destructive" : ""}
              />
              {errors.ticker && (
                <p className="text-sm text-destructive">{errors.ticker}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="condition">Condicao</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as AlertCondition)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Preco acima de</SelectItem>
                  <SelectItem value="below">Preco abaixo de</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Preco Alvo (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => {
                  setTargetPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                }}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                placeholder="Ex: Ponto de entrada"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Criar Alerta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AlertRow({ alert }: { alert: PriceAlert }) {
  const updateMutation = useUpdateAlert();
  const deleteMutation = useDeleteAlert();

  const handleToggleActive = () => {
    updateMutation.mutate({
      id: alert.id,
      data: { is_active: !alert.is_active },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(alert.id);
  };

  return (
    <div className="flex items-center justify-between border-b py-4 last:border-0">
      <div className="flex items-center gap-4">
        <div
          className={`rounded-full p-2 ${
            alert.is_triggered
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : alert.is_active
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {alert.condition === "above" ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{alert.ticker}</span>
            <Badge variant={alert.is_triggered ? "default" : alert.is_active ? "secondary" : "outline"}>
              {alert.is_triggered ? "Disparado" : alert.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {alert.condition === "above" ? "Acima de" : "Abaixo de"}{" "}
            {formatCurrency(alert.target_price)}
            {alert.notes && <span className="ml-2 italic">- {alert.notes}</span>}
          </div>
          {alert.is_triggered && alert.triggered_at && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Disparado em{" "}
              {format(new Date(alert.triggered_at), "dd/MM/yyyy 'as' HH:mm", {
                locale: ptBR,
              })}
              {alert.triggered_price && ` a ${formatCurrency(alert.triggered_price)}`}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={alert.is_active}
            onCheckedChange={handleToggleActive}
            disabled={alert.is_triggered || updateMutation.isPending}
          />
          <span className="text-sm text-muted-foreground">
            {alert.is_active ? "Ativo" : "Inativo"}
          </span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir alerta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acao nao pode ser desfeita. O alerta de preco para {alert.ticker} sera
                removido permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function AlertSkeleton() {
  return (
    <div className="flex items-center justify-between border-b py-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "triggered">("all");

  const { data, isLoading, error } = useAlerts({
    isActive: filter === "active" ? true : undefined,
  });

  const filteredAlerts =
    data?.alerts.filter((a) => {
      if (filter === "triggered") return a.is_triggered;
      return true;
    }) || [];

  const activeCount = data?.alerts.filter((a) => a.is_active && !a.is_triggered).length || 0;
  const triggeredCount = data?.alerts.filter((a) => a.is_triggered).length || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Alertas de Preco</h1>
          <p className="text-muted-foreground mt-1">
            Configure alertas para ser notificado quando os precos atingirem seus alvos
          </p>
        </div>
        <CreateAlertDialog />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{activeCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Disparados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{triggeredCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Meus Alertas</CardTitle>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Apenas ativos</SelectItem>
              <SelectItem value="triggered">Disparados</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-destructive">
              Erro ao carregar alertas. Tente novamente mais tarde.
            </div>
          )}

          {isLoading && (
            <div>
              {[...Array(3)].map((_, i) => (
                <AlertSkeleton key={i} />
              ))}
            </div>
          )}

          {data && filteredAlerts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum alerta encontrado</p>
              <p className="text-sm mt-1">
                {filter !== "all"
                  ? "Tente remover o filtro para ver todos os alertas"
                  : "Crie seu primeiro alerta de preco clicando no botao acima"}
              </p>
            </div>
          )}

          {data && filteredAlerts.length > 0 && (
            <div className="divide-y">
              {filteredAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
