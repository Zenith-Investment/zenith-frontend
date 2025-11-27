"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Loader2,
  PieChart,
  Briefcase,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  usePortfolio,
  useAddAsset,
  useRemoveAsset,
} from "@/hooks/use-portfolio";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { AllocationChart } from "@/components/charts";
import { exportPortfolio } from "@/hooks/use-exports";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AssetClass, AddAssetRequest } from "@/types/portfolio";

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  stocks: "Ações",
  fiis: "FIIs",
  fixed_income: "Renda Fixa",
  crypto: "Crypto",
  etf: "ETFs",
  bdr: "BDRs",
  funds: "Fundos",
  cash: "Reserva",
  other: "Outros",
};

export default function PortfolioPage() {
  const { toast } = useToast();
  const { data: portfolio, isLoading, error, refetch } = usePortfolio();
  const addAssetMutation = useAddAsset();
  const removeAssetMutation = useRemoveAsset();

  const [showAddForm, setShowAddForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [newAsset, setNewAsset] = useState<AddAssetRequest>({
    ticker: "",
    asset_class: "stocks",
    quantity: 0,
    average_price: 0,
    broker: "",
  });

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAsset.ticker || newAsset.quantity <= 0 || newAsset.average_price <= 0) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: "Preencha todos os campos corretamente.",
      });
      return;
    }

    try {
      await addAssetMutation.mutateAsync(newAsset);
      toast({
        title: "Ativo adicionado",
        description: `${newAsset.ticker.toUpperCase()} foi adicionado à sua carteira.`,
      });
      setNewAsset({
        ticker: "",
        asset_class: "stocks",
        quantity: 0,
        average_price: 0,
        broker: "",
      });
      setShowAddForm(false);
      refetch();
    } catch {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar ativo",
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const handleRemoveAsset = async (assetId: number, ticker: string) => {
    if (!confirm(`Deseja remover ${ticker} da sua carteira?`)) return;

    try {
      await removeAssetMutation.mutateAsync(assetId);
      toast({
        title: "Ativo removido",
        description: `${ticker} foi removido da sua carteira.`,
      });
      refetch();
    } catch {
      toast({
        variant: "destructive",
        title: "Erro ao remover ativo",
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const handleExport = async (format: "excel" | "csv") => {
    setIsExporting(true);
    try {
      await exportPortfolio(format);
      toast({
        title: "Exportacao concluida",
        description: `Carteira exportada com sucesso para ${format.toUpperCase()}.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Erro na exportacao",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <Header title="Minha Carteira" description="Gerencie seus investimentos" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <Header title="Minha Carteira" description="Gerencie seus investimentos" />
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Erro ao carregar carteira.</p>
              <Button onClick={() => refetch()} className="mt-4">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasAssets = portfolio && portfolio.assets.length > 0;

  return (
    <div className="flex flex-col">
      <Header title="Minha Carteira" description="Gerencie seus investimentos" />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Patrimônio Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolio?.summary.current_value ?? 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Investido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolio?.summary.total_invested ?? 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro/Prejuízo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold flex items-center gap-2 ${
                  (portfolio?.summary.total_profit_loss ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(portfolio?.summary.total_profit_loss ?? 0) >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                {formatCurrency(portfolio?.summary.total_profit_loss ?? 0)}
              </div>
              <p
                className={`text-sm ${
                  (portfolio?.summary.total_profit_loss_percentage ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(portfolio?.summary.total_profit_loss_percentage ?? 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolio?.summary.assets_count ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assets" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="assets" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Ativos
              </TabsTrigger>
              <TabsTrigger value="allocation" className="gap-2">
                <PieChart className="h-4 w-4" />
                Alocação
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isExporting || !hasAssets}>
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV (.csv)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Ativo
              </Button>
            </div>
          </div>

          {/* Add Asset Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Ativo</CardTitle>
                <CardDescription>
                  Adicione um novo ativo à sua carteira
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAsset} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-2">
                      <Label htmlFor="ticker">Ticker</Label>
                      <Input
                        id="ticker"
                        placeholder="PETR4"
                        value={newAsset.ticker}
                        onChange={(e) =>
                          setNewAsset({ ...newAsset, ticker: e.target.value.toUpperCase() })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="asset_class">Tipo</Label>
                      <select
                        id="asset_class"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newAsset.asset_class}
                        onChange={(e) =>
                          setNewAsset({
                            ...newAsset,
                            asset_class: e.target.value as AssetClass,
                          })
                        }
                      >
                        <option value="stocks">Ações</option>
                        <option value="fiis">FIIs</option>
                        <option value="etf">ETFs</option>
                        <option value="bdr">BDRs</option>
                        <option value="fixed_income">Renda Fixa</option>
                        <option value="crypto">Crypto</option>
                        <option value="funds">Fundos</option>
                        <option value="other">Outros</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        placeholder="100"
                        value={newAsset.quantity || ""}
                        onChange={(e) =>
                          setNewAsset({
                            ...newAsset,
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="average_price">Preço Médio (R$)</Label>
                      <Input
                        id="average_price"
                        type="number"
                        step="0.01"
                        placeholder="35.50"
                        value={newAsset.average_price || ""}
                        onChange={(e) =>
                          setNewAsset({
                            ...newAsset,
                            average_price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="broker">Corretora</Label>
                      <Input
                        id="broker"
                        placeholder="XP, Clear..."
                        value={newAsset.broker || ""}
                        onChange={(e) =>
                          setNewAsset({ ...newAsset, broker: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={addAssetMutation.isPending}>
                      {addAssetMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Assets List */}
          <TabsContent value="assets">
            <Card>
              <CardHeader>
                <CardTitle>Seus Ativos</CardTitle>
                <CardDescription>
                  {hasAssets
                    ? `${portfolio.assets.length} ativos na carteira`
                    : "Você ainda não possui ativos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasAssets ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-muted-foreground">
                          <th className="pb-3 font-medium">Ativo</th>
                          <th className="pb-3 font-medium">Tipo</th>
                          <th className="pb-3 font-medium text-right">Qtd</th>
                          <th className="pb-3 font-medium text-right">PM</th>
                          <th className="pb-3 font-medium text-right">Atual</th>
                          <th className="pb-3 font-medium text-right">Total</th>
                          <th className="pb-3 font-medium text-right">Retorno</th>
                          <th className="pb-3 font-medium text-right">%</th>
                          <th className="pb-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.assets.map((asset) => (
                          <tr key={asset.id} className="border-b last:border-0">
                            <td className="py-4">
                              <div className="font-medium">{asset.ticker}</div>
                              {asset.broker && (
                                <div className="text-xs text-muted-foreground">
                                  {asset.broker}
                                </div>
                              )}
                            </td>
                            <td className="py-4">
                              <span className="rounded bg-muted px-2 py-1 text-xs">
                                {ASSET_CLASS_LABELS[asset.asset_class]}
                              </span>
                            </td>
                            <td className="py-4 text-right">{asset.quantity}</td>
                            <td className="py-4 text-right">
                              {formatCurrency(asset.average_price)}
                            </td>
                            <td className="py-4 text-right">
                              {asset.current_price
                                ? formatCurrency(asset.current_price)
                                : "-"}
                            </td>
                            <td className="py-4 text-right font-medium">
                              {formatCurrency(
                                asset.current_value ?? asset.total_invested
                              )}
                            </td>
                            <td
                              className={`py-4 text-right ${
                                (asset.profit_loss ?? 0) >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {asset.profit_loss !== null
                                ? formatCurrency(asset.profit_loss)
                                : "-"}
                            </td>
                            <td
                              className={`py-4 text-right ${
                                (asset.profit_loss_percentage ?? 0) >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {asset.profit_loss_percentage !== null
                                ? formatPercentage(asset.profit_loss_percentage)
                                : "-"}
                            </td>
                            <td className="py-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveAsset(asset.id, asset.ticker)
                                }
                                disabled={removeAssetMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">
                      Sua carteira está vazia
                    </p>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar primeiro ativo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Allocation */}
          <TabsContent value="allocation">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Alocacao por Classe</CardTitle>
                  <CardDescription>
                    Distribuicao visual dos seus investimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {portfolio?.allocation_by_class &&
                  portfolio.allocation_by_class.length > 0 ? (
                    <AllocationChart data={portfolio.allocation_by_class} height={300} />
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">
                        Adicione ativos para ver a alocacao
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Allocation Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Alocacao</CardTitle>
                  <CardDescription>
                    Valores por classe de ativo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {portfolio?.allocation_by_class &&
                  portfolio.allocation_by_class.length > 0 ? (
                    <div className="space-y-4">
                      {portfolio.allocation_by_class.map((alloc) => (
                        <div key={alloc.asset_class} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {ASSET_CLASS_LABELS[alloc.asset_class]}
                            </span>
                            <span>
                              {formatCurrency(alloc.value)} ({alloc.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${alloc.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Sem dados de alocacao
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
