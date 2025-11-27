"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardList, Loader2, Sparkles, Target, TrendingUp, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkProfileExists } from "@/hooks/use-profile";

// Onboarding steps
const steps = [
  {
    id: 1,
    name: "Bem-vindo",
    description: "Conheca a plataforma",
    icon: Sparkles,
  },
  {
    id: 2,
    name: "Perfil",
    description: "Avaliacao de investidor",
    icon: ClipboardList,
  },
  {
    id: 3,
    name: "Concluido",
    description: "Pronto para investir",
    icon: Check,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      const hasProfile = await checkProfileExists();
      if (hasProfile) {
        // User already has profile, redirect to dashboard
        router.push("/dashboard");
      } else {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      index === 0
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background text-muted-foreground"
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-medium ${
                        index === 0 ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-4 h-0.5 w-12 sm:w-20 bg-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              Bem-vindo ao Zenith!
            </CardTitle>
            <CardDescription>
              Vamos conhecer seu perfil de investidor para oferecer as melhores
              recomendacoes personalizadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Recomendacoes Personalizadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Receba sugestoes de investimentos alinhadas aos seus objetivos
                    e tolerancia a risco.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">Estrategias Otimizadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Descubra as melhores estrategias de investimento para o seu
                    perfil e horizonte de tempo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium">Gestao de Risco</h3>
                  <p className="text-sm text-muted-foreground">
                    Alertas e analises de risco ajustados ao seu perfil de
                    investidor.
                  </p>
                </div>
              </div>
            </div>

            {/* Time estimate */}
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                O questionario leva aproximadamente <strong>2 minutos</strong> para
                completar.
              </p>
            </div>

            {/* CTA */}
            <Button
              onClick={() => router.push("/onboarding/profile-assessment")}
              className="w-full"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Iniciar Avaliacao
            </Button>

            {/* Skip option */}
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Pular por agora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
