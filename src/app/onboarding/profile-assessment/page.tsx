"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import api, { getErrorMessage } from "@/lib/api";

interface Question {
  id: number;
  question: string;
  category: string;
  options: {
    id: number;
    text: string;
    score: number;
  }[];
}

interface AssessmentResult {
  risk_profile: string;
  risk_score: number;
  investment_horizon: string;
  primary_goals: string[];
  recommended_allocation: {
    asset_class: string;
    percentage: number;
    description: string;
  }[];
  explanation: string;
}

export default function ProfileAssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    startAssessment();
  }, []);

  const startAssessment = async () => {
    try {
      const response = await api.post("/profile/assessment/start");
      setSessionId(response.data.session_id);
      setQuestions(response.data.questions);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnsweredCurrent = currentQuestion?.id in answers;

  const selectAnswer = (optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const goToNext = () => {
    if (isLastQuestion) {
      submitAssessment();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/profile/assessment/submit", {
        session_id: sessionId,
        answers,
      });
      setResult(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show result screen
  if (result) {
    return (
      <div className="min-h-screen bg-muted/50 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Seu Perfil de Investidor
              </CardTitle>
              <CardDescription>
                Análise completa baseada nas suas respostas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Badge */}
              <div className="rounded-lg border bg-primary/5 p-6 text-center">
                <p className="text-sm text-muted-foreground">Seu perfil é</p>
                <h2 className="mt-2 text-3xl font-bold capitalize text-primary">
                  {result.risk_profile === "conservative" && "Conservador"}
                  {result.risk_profile === "moderate" && "Moderado"}
                  {result.risk_profile === "balanced" && "Balanceado"}
                  {result.risk_profile === "growth" && "Arrojado"}
                  {result.risk_profile === "aggressive" && "Agressivo"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Score de risco: {result.risk_score}/100
                </p>
              </div>

              {/* Explanation */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-line text-muted-foreground">
                  {result.explanation}
                </p>
              </div>

              {/* Recommended Allocation */}
              <div>
                <h3 className="mb-4 font-semibold">Alocação Recomendada</h3>
                <div className="space-y-3">
                  {result.recommended_allocation.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.asset_class}</span>
                        <span className="text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button onClick={goToDashboard} className="w-full" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show questionnaire
  return (
    <div className="min-h-screen bg-muted/50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Pergunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  {currentQuestion?.category === "demographics" && "Dados Pessoais"}
                  {currentQuestion?.category === "financial_situation" && "Situação Financeira"}
                  {currentQuestion?.category === "goals" && "Objetivos"}
                  {currentQuestion?.category === "horizon" && "Horizonte de Investimento"}
                  {currentQuestion?.category === "experience" && "Experiência"}
                  {currentQuestion?.category === "risk_tolerance" && "Tolerância a Risco"}
                  {currentQuestion?.category === "liquidity" && "Liquidez"}
                </span>
                <CardTitle className="text-xl">
                  {currentQuestion?.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQuestion?.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => selectAnswer(option.id)}
                      className={`w-full rounded-lg border p-4 text-left transition-all hover:border-primary ${
                        answers[currentQuestion.id] === option.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-sm">{option.text}</span>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>

                  <Button
                    onClick={goToNext}
                    disabled={!hasAnsweredCurrent || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : isLastQuestion ? (
                      <>
                        Ver Resultado
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Próxima
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
