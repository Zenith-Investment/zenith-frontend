"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Clock,
  DollarSign,
  PiggyBank,
  Shield,
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
import Link from "next/link";

const COURSES = [
  {
    id: "basics",
    title: "Fundamentos de Investimentos",
    description: "Aprenda os conceitos basicos para comecar a investir",
    icon: BookOpen,
    lessons: 8,
    duration: "2h",
    level: "Iniciante",
    color: "bg-blue-500",
  },
  {
    id: "stocks",
    title: "Investindo em Acoes",
    description: "Como analisar e investir em acoes na bolsa de valores",
    icon: TrendingUp,
    lessons: 12,
    duration: "4h",
    level: "Intermediario",
    color: "bg-green-500",
  },
  {
    id: "fiis",
    title: "Fundos Imobiliarios",
    description: "Tudo sobre FIIs e como gerar renda passiva",
    icon: PiggyBank,
    lessons: 10,
    duration: "3h",
    level: "Intermediario",
    color: "bg-purple-500",
  },
  {
    id: "fixed-income",
    title: "Renda Fixa",
    description: "CDB, Tesouro Direto, LCI, LCA e outros produtos",
    icon: Shield,
    lessons: 6,
    duration: "1.5h",
    level: "Iniciante",
    color: "bg-yellow-500",
  },
  {
    id: "analysis",
    title: "Analise Fundamentalista",
    description: "Aprenda a analisar empresas e seus fundamentos",
    icon: BarChart3,
    lessons: 15,
    duration: "5h",
    level: "Avancado",
    color: "bg-orange-500",
  },
  {
    id: "portfolio",
    title: "Construcao de Carteira",
    description: "Estrategias de diversificacao e alocacao de ativos",
    icon: DollarSign,
    lessons: 8,
    duration: "2.5h",
    level: "Intermediario",
    color: "bg-red-500",
  },
];

const QUICK_TIPS = [
  {
    title: "Reserva de Emergencia",
    tip: "Mantenha de 6 a 12 meses de despesas em investimentos de alta liquidez antes de diversificar.",
  },
  {
    title: "Diversificacao",
    tip: "Nao coloque todos os ovos na mesma cesta. Distribua seus investimentos em diferentes classes de ativos.",
  },
  {
    title: "Investimento Regular",
    tip: "Invista regularmente, independente do momento do mercado. O tempo no mercado supera o timing do mercado.",
  },
  {
    title: "Custos Importam",
    tip: "Atencao as taxas de administracao e corretagem. Custos menores significam mais retorno para voce.",
  },
];

export default function LearnPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Aprender"
        description="Conhecimento e realmente poder nos investimentos"
      />

      <div className="p-6 space-y-8">
        {/* AI Assistant Banner */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Tem duvidas sobre investimentos?</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa IA pode explicar qualquer conceito de forma simples
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/chat">Perguntar a IA</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Cursos e Trilhas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className={`h-2 ${course.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${course.color} text-white`}
                    >
                      <course.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {course.level}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.lessons} licoes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Comecar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Dicas Rapidas</CardTitle>
            <CardDescription>
              Principios fundamentais para investir com sabedoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {QUICK_TIPS.map((item, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <h4 className="mb-2 font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Glossary Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Glossario de Investimentos</CardTitle>
            <CardDescription>
              Termos mais usados no mercado financeiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold">Dividend Yield (DY)</h4>
                <p className="text-sm text-muted-foreground">
                  Indicador que mostra o retorno em dividendos de uma acao ou FII em relacao ao seu preco. Calculado dividindo os dividendos pagos pelo preco do ativo.
                </p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-semibold">P/L (Preco/Lucro)</h4>
                <p className="text-sm text-muted-foreground">
                  Multiplo que indica quantos anos de lucro seriam necessarios para recuperar o investimento no preco atual. Um P/L menor pode indicar uma acao mais barata.
                </p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-semibold">Selic</h4>
                <p className="text-sm text-muted-foreground">
                  Taxa basica de juros da economia brasileira. Serve como referencia para todas as outras taxas de juros do pais e influencia diretamente os investimentos de renda fixa.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">CDI</h4>
                <p className="text-sm text-muted-foreground">
                  Certificado de Deposito Interbancario. Taxa usada como benchmark para investimentos de renda fixa. Geralmente acompanha de perto a taxa Selic.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground">
          O conteudo educacional apresentado nao constitui recomendacao de investimento.
          Sempre consulte um profissional antes de tomar decisoes financeiras.
        </p>
      </div>
    </div>
  );
}
