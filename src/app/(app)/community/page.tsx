"use client";

import { useState, useEffect } from "react";
import {
  Award,
  BarChart3,
  CheckCircle,
  Loader2,
  Plus,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCommunity, CommunityStrategy, StrategyMatch } from "@/hooks/use-community";

// Format percentage
const formatPercent = (value: number) => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

// Risk profile badge
const RiskBadge = ({ profile }: { profile: string }) => {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    conservative: "default",
    moderate: "secondary",
    aggressive: "destructive",
  };
  const labels: Record<string, string> = {
    conservative: "Conservador",
    moderate: "Moderado",
    aggressive: "Agressivo",
  };
  return (
    <Badge variant={variants[profile] || "secondary"}>
      {labels[profile] || profile}
    </Badge>
  );
};

// Strategy card component
const StrategyCard = ({
  strategy,
  matchScore,
  reasons,
  onUse,
  isLoading,
}: {
  strategy: CommunityStrategy;
  matchScore?: number;
  reasons?: string[];
  onUse: (strategy: CommunityStrategy) => void;
  isLoading: boolean;
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{strategy.strategy_name}</CardTitle>
            <CardDescription>{strategy.strategy_type}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {strategy.is_featured && (
              <Badge variant="outline" className="gap-1">
                <Award className="h-3 w-3" />
                Destaque
              </Badge>
            )}
            <RiskBadge profile={strategy.target_risk_profile} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        {strategy.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {strategy.description}
          </p>
        )}

        {/* Match Score */}
        {matchScore !== undefined && (
          <div className="rounded-lg bg-primary/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compatibilidade</span>
              <span className="text-lg font-bold text-primary">
                {(matchScore * 100).toFixed(0)}%
              </span>
            </div>
            {reasons && reasons.length > 0 && (
              <ul className="mt-2 space-y-1">
                {reasons.slice(0, 2).map((reason, i) => (
                  <li key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border p-2">
            <p className="text-xs text-muted-foreground">Retorno Total</p>
            <p
              className={`font-semibold ${
                strategy.total_return >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercent(strategy.total_return)}
            </p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs text-muted-foreground">Retorno Anual</p>
            <p
              className={`font-semibold ${
                strategy.annualized_return >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercent(strategy.annualized_return)}
            </p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
            <p className="font-semibold">{strategy.sharpe_ratio.toFixed(2)}</p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs text-muted-foreground">Max Drawdown</p>
            <p className="font-semibold text-red-600">
              {formatPercent(strategy.max_drawdown)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{strategy.times_used} usuarios</span>
          </div>
          {strategy.community_rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{strategy.community_rating.toFixed(1)}</span>
            </div>
          )}
          {strategy.avg_user_return !== undefined && strategy.avg_user_return !== null && (
            <div className="flex items-center gap-1">
              {strategy.avg_user_return >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={
                  strategy.avg_user_return >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {formatPercent(strategy.avg_user_return)} medio
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        <Button
          className="w-full"
          onClick={() => onUse(strategy)}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Usar Estrategia
        </Button>
      </CardContent>
    </Card>
  );
};

export default function CommunityPage() {
  const {
    isLoading,
    recommendedStrategies,
    featuredStrategies,
    topStrategies,
    myStrategies,
    fetchRecommended,
    fetchFeatured,
    fetchTop,
    useStrategy,
    fetchMyStrategies,
  } = useCommunity();

  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<CommunityStrategy | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("10000");

  // Load data on mount
  useEffect(() => {
    fetchRecommended(6);
    fetchFeatured(6);
    fetchTop("sharpe_ratio", 10);
    fetchMyStrategies();
  }, [fetchRecommended, fetchFeatured, fetchTop, fetchMyStrategies]);

  const handleOpenUseDialog = (strategy: CommunityStrategy) => {
    setSelectedStrategy(strategy);
    setUseDialogOpen(true);
  };

  const handleUseStrategy = async () => {
    if (!selectedStrategy) return;
    const result = await useStrategy(selectedStrategy.id, parseFloat(investmentAmount));
    if (result) {
      setUseDialogOpen(false);
      setSelectedStrategy(null);
      setInvestmentAmount("10000");
    }
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Comunidade"
        description="Estrategias compartilhadas pela comunidade de investidores"
      />

      <div className="p-6">
        <Tabs defaultValue="recommended" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="recommended" className="gap-2">
              <Target className="h-4 w-4" />
              Para Voce
            </TabsTrigger>
            <TabsTrigger value="featured" className="gap-2">
              <Award className="h-4 w-4" />
              Destaque
            </TabsTrigger>
            <TabsTrigger value="top" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="my" className="gap-2">
              <Users className="h-4 w-4" />
              Minhas
            </TabsTrigger>
          </TabsList>

          {/* Recommended Tab */}
          <TabsContent value="recommended" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Recomendadas para Voce</h2>
              <p className="text-muted-foreground mb-4">
                Estrategias selecionadas com base no seu perfil de investidor
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recommendedStrategies.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedStrategies.map((match) => (
                  <StrategyCard
                    key={match.strategy.id}
                    strategy={match.strategy}
                    matchScore={match.match_score}
                    reasons={match.reasons}
                    onUse={handleOpenUseDialog}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">
                    Complete seu perfil de investidor para receber recomendacoes personalizadas
                  </p>
                  <Button className="mt-4" asChild>
                    <a href="/profile">Completar Perfil</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Estrategias em Destaque</h2>
              <p className="text-muted-foreground mb-4">
                As estrategias mais bem avaliadas pela comunidade
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : featuredStrategies.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredStrategies.map((strategy) => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    onUse={handleOpenUseDialog}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">
                    Nenhuma estrategia em destaque no momento
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Top Tab */}
          <TabsContent value="top" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Ranking de Estrategias</h2>
              <p className="text-muted-foreground mb-4">
                As estrategias com melhor desempenho historico
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : topStrategies.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {topStrategies.map((strategy, index) => (
                      <div
                        key={strategy.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-600"
                                : index === 1
                                ? "bg-gray-100 text-gray-600"
                                : index === 2
                                ? "bg-orange-100 text-orange-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{strategy.strategy_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {strategy.strategy_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Sharpe</p>
                            <p className="font-semibold">{strategy.sharpe_ratio.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Retorno</p>
                            <p
                              className={`font-semibold ${
                                strategy.annualized_return >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatPercent(strategy.annualized_return)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleOpenUseDialog(strategy)}
                            disabled={isLoading}
                          >
                            Usar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">
                    Nenhuma estrategia no ranking ainda
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Strategies Tab */}
          <TabsContent value="my" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Minhas Estrategias</h2>
              <p className="text-muted-foreground mb-4">
                Estrategias que voce esta usando ou ja usou
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : myStrategies.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {myStrategies.map((usage) => (
                  <Card key={usage.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{usage.strategy_name}</CardTitle>
                        <Badge variant={usage.is_active ? "default" : "secondary"}>
                          {usage.is_active ? "Ativa" : "Encerrada"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor Inicial</p>
                          <p className="font-semibold">
                            R$ {usage.initial_value.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valor Atual</p>
                          <p className="font-semibold">
                            {usage.current_value
                              ? `R$ ${usage.current_value.toLocaleString("pt-BR")}`
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Retorno</p>
                          <p
                            className={`font-semibold ${
                              (usage.return_pct || 0) >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {usage.return_pct !== undefined
                              ? formatPercent(usage.return_pct)
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Inicio</p>
                          <p className="font-semibold">
                            {new Date(usage.started_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {usage.rating && (
                        <div className="mt-3 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= usage.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">
                    Voce ainda nao esta usando nenhuma estrategia
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      const tabs = document.querySelector('[value="recommended"]') as HTMLElement;
                      tabs?.click();
                    }}
                  >
                    Explorar Estrategias
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Use Strategy Dialog */}
      <Dialog open={useDialogOpen} onOpenChange={setUseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usar Estrategia</DialogTitle>
            <DialogDescription>
              {selectedStrategy?.strategy_name} - {selectedStrategy?.strategy_type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor Inicial (R$)</Label>
              <Input
                id="amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                min="100"
              />
              <p className="text-xs text-muted-foreground">
                Este valor sera usado para acompanhar seu progresso com esta estrategia.
              </p>
            </div>

            {selectedStrategy && (
              <div className="rounded-lg border p-3 text-sm">
                <p className="font-medium mb-2">Resumo da Estrategia</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>Retorno historico: <span className={selectedStrategy.total_return >= 0 ? "text-green-600" : "text-red-600"}>{formatPercent(selectedStrategy.total_return)}</span></div>
                  <div>Sharpe Ratio: {selectedStrategy.sharpe_ratio.toFixed(2)}</div>
                  <div>Max Drawdown: <span className="text-red-600">{formatPercent(selectedStrategy.max_drawdown)}</span></div>
                  <div>Usuarios: {selectedStrategy.times_used}</div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Resultados passados nao garantem resultados futuros. A decisao de investir e de sua responsabilidade.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUseStrategy} disabled={isLoading || !investmentAmount}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
