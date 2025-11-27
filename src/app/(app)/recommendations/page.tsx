"use client";

import {
  ArrowDown,
  ArrowUp,
  Bot,
  Loader2,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
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
import { Progress } from "@/components/ui/progress";
import { useRecommendations, type Recommendation, type AllocationTarget } from "@/hooks/use-recommendations";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";

const ASSET_CLASS_LABELS: Record<string, string> = {
  stocks: "Acoes",
  fiis: "Fundos Imobiliarios",
  fixed_income: "Renda Fixa",
  etf: "ETFs",
  crypto: "Criptomoedas",
  cash: "Reserva",
};

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const actionConfig = {
    buy: {
      label: "Comprar",
      icon: TrendingUp,
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-700 dark:text-green-400",
      borderClass: "border-green-200 dark:border-green-800",
    },
    sell: {
      label: "Vender",
      icon: TrendingDown,
      bgClass: "bg-red-100 dark:bg-red-900/30",
      textClass: "text-red-700 dark:text-red-400",
      borderClass: "border-red-200 dark:border-red-800",
    },
    hold: {
      label: "Manter",
      icon: Minus,
      bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
      textClass: "text-yellow-700 dark:text-yellow-400",
      borderClass: "border-yellow-200 dark:border-yellow-800",
    },
  };

  const config = actionConfig[recommendation.action];
  const Icon = config.icon;
  const confidencePercent = Math.round(recommendation.confidence * 100);

  return (
    <Card className={cn("border-2", config.borderClass)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">{recommendation.ticker}</span>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  config.bgClass,
                  config.textClass
                )}
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </span>
            </CardTitle>
            {recommendation.name && (
              <CardDescription>{recommendation.name}</CardDescription>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Confianca</div>
            <div className="text-lg font-semibold">{confidencePercent}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Classe: </span>
            <span className="font-medium">
              {ASSET_CLASS_LABELS[recommendation.asset_class] || recommendation.asset_class}
            </span>
          </div>
          {recommendation.current_price && (
            <div>
              <span className="text-muted-foreground">Preco: </span>
              <span className="font-medium">
                {formatCurrency(recommendation.current_price)}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Nivel de confianca</span>
            <span>{confidencePercent}%</span>
          </div>
          <Progress value={confidencePercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function AllocationCard({ target }: { target: AllocationTarget }) {
  const actionConfig = {
    increase: {
      label: "Aumentar",
      icon: ArrowUp,
      color: "text-green-600",
    },
    decrease: {
      label: "Reduzir",
      icon: ArrowDown,
      color: "text-red-600",
    },
    maintain: {
      label: "Manter",
      icon: Minus,
      color: "text-yellow-600",
    },
  };

  const config = actionConfig[target.action];
  const Icon = config.icon;
  const diffAbs = Math.abs(target.difference);

  return (
    <div className="flex items-center justify-between border-b py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
            config.color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-medium">
            {ASSET_CLASS_LABELS[target.asset_class] || target.asset_class}
          </div>
          <div className="text-sm text-muted-foreground">
            {config.label}{" "}
            {target.action !== "maintain" && (
              <span className={config.color}>
                {target.difference > 0 ? "+" : ""}
                {target.difference.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Atual</div>
            <div className="font-medium">{target.current_percentage.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Meta</div>
            <div className="font-medium text-primary">
              {target.target_percentage.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="mt-2 w-32">
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-muted-foreground/50"
              style={{ width: `${target.current_percentage}%` }}
            />
          </div>
          <div className="relative -mt-2 h-2">
            <div
              className="absolute top-0 h-2 w-0.5 bg-primary"
              style={{ left: `${target.target_percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { data, isLoading, error, refetch } = useRecommendations();

  return (
    <div className="flex flex-col">
      <Header
        title="Recomendacoes"
        description="Sugestoes personalizadas baseadas no seu perfil"
      />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Analisando seu perfil e carteira...
            </p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-muted-foreground">
                Erro ao carregar recomendacoes.
              </p>
              <Button onClick={() => refetch()}>Tentar novamente</Button>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* Summary */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Analise da IA</h3>
                  <p className="text-sm text-muted-foreground">{data.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Grid */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recomendacoes de Ativos</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/chat">
                    <Bot className="mr-2 h-4 w-4" />
                    Perguntar a IA
                  </Link>
                </Button>
              </div>
              {data.recommendations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      Complete seu perfil de investidor para receber recomendacoes personalizadas.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/onboarding/profile-assessment">Completar perfil</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.recommendations.map((rec, i) => (
                    <RecommendationCard key={i} recommendation={rec} />
                  ))}
                </div>
              )}
            </div>

            {/* Allocation Targets */}
            {data.allocation_targets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Metas de Alocacao
                  </CardTitle>
                  <CardDescription>
                    Ajustes sugeridos para otimizar sua carteira de acordo com seu perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.allocation_targets.map((target, i) => (
                    <AllocationCard key={i} target={target} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Aviso:</strong> As recomendacoes apresentadas sao geradas por inteligencia
                  artificial com base no seu perfil e carteira. Nao constituem aconselhamento
                  financeiro profissional. Sempre consulte um especialista antes de tomar decisoes
                  de investimento.
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
