"use client";

import {
  BarChart3,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  User,
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
import { useInvestorProfile } from "@/hooks/use-profile";
import { useAuthStore } from "@/stores/auth";
import Link from "next/link";

const RISK_PROFILES = {
  conservative: {
    name: "Conservador",
    description: "Prioriza a preservacao do capital e baixa volatilidade",
    color: "bg-blue-500",
  },
  moderate: {
    name: "Moderado",
    description: "Equilibra seguranca com crescimento gradual",
    color: "bg-green-500",
  },
  balanced: {
    name: "Equilibrado",
    description: "Busca crescimento com risco controlado",
    color: "bg-yellow-500",
  },
  growth: {
    name: "Crescimento",
    description: "Foca em valorizacao de longo prazo",
    color: "bg-orange-500",
  },
  aggressive: {
    name: "Agressivo",
    description: "Alta tolerancia a risco em busca de retornos maiores",
    color: "bg-red-500",
  },
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediario",
  advanced: "Avancado",
  expert: "Especialista",
};

const HORIZON_LABELS: Record<string, string> = {
  short: "Curto prazo (ate 2 anos)",
  medium: "Medio prazo (2-5 anos)",
  long: "Longo prazo (5-10 anos)",
  very_long: "Muito longo prazo (10+ anos)",
};

const GOAL_LABELS: Record<string, string> = {
  retirement: "Aposentadoria",
  wealth: "Construcao de patrimonio",
  income: "Geracao de renda",
  education: "Educacao dos filhos",
  emergency: "Reserva de emergencia",
  house: "Compra de imovel",
  travel: "Viagens",
  other: "Outros",
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading, error } = useInvestorProfile();

  const riskConfig = profile
    ? RISK_PROFILES[profile.risk_profile] || RISK_PROFILES.moderate
    : RISK_PROFILES.moderate;

  return (
    <div className="flex flex-col">
      <Header
        title="Perfil de Investidor"
        description="Seu perfil e preferencias de investimento"
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
          </div>
        ) : error || !profile ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Perfil nao encontrado
              </h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Voce ainda nao completou o questionario de perfil de investidor.
                Complete o questionario para receber recomendacoes personalizadas.
              </p>
              <Button asChild>
                <Link href="/onboarding/profile-assessment">
                  Iniciar avaliacao
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{user?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plano</p>
                    <p className="font-medium capitalize">
                      {user?.subscription_plan || "Starter"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Profile */}
            <Card className="border-2" style={{ borderColor: `var(--${riskConfig.color.replace('bg-', '')})` }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Perfil de Risco
                </CardTitle>
                <CardDescription>{riskConfig.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${riskConfig.color} text-white`}
                  >
                    <span className="text-2xl font-bold">
                      {profile.risk_score}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{riskConfig.name}</h3>
                    <p className="text-muted-foreground">
                      Score de risco: {profile.risk_score}/100
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conservador</span>
                    <span>Agressivo</span>
                  </div>
                  <Progress value={profile.risk_score} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Investment Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Horizon & Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Horizonte de Investimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Prazo planejado
                    </p>
                    <p className="font-medium">
                      {HORIZON_LABELS[profile.investment_horizon] ||
                        profile.investment_horizon}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nivel de experiencia
                    </p>
                    <p className="font-medium">
                      {EXPERIENCE_LABELS[profile.experience_level] ||
                        profile.experience_level}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.primary_goals.map((goal, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {GOAL_LABELS[goal] || goal}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Informacoes Financeiras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.monthly_income && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Renda mensal
                      </p>
                      <p className="font-medium">{profile.monthly_income}</p>
                    </div>
                  )}
                  {profile.monthly_investment && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Investimento mensal
                      </p>
                      <p className="font-medium">
                        {profile.monthly_investment}
                      </p>
                    </div>
                  )}
                  {profile.total_patrimony && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Patrimonio total
                      </p>
                      <p className="font-medium">{profile.total_patrimony}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Acoes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" asChild>
                    <Link href="/recommendations">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Ver recomendacoes
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/onboarding/profile-assessment">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refazer avaliacao
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Last Updated */}
            <p className="text-center text-sm text-muted-foreground">
              Perfil criado em{" "}
              {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              {profile.updated_at &&
                ` • Atualizado em ${new Date(profile.updated_at).toLocaleDateString("pt-BR")}`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
