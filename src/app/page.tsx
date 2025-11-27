"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useAnimation, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bot,
  LineChart,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Bell,
  Target,
  Users,
  Award,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronUp,
  PieChart,
  Zap,
  Lock,
  BarChart3,
  Brain,
  Clock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Menu,
  X,
  Building2,
  Landmark,
  Link2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInDown = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Animated Counter Hook
function useCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasStarted) return;

    setHasStarted(true);
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, isInView, startOnView, hasStarted]);

  return { count, ref };
}

// Animated Section Component
function AnimatedSection({
  children,
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay, ease: "easeOut" }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// DATA
// ============================================================================

const stats = [
  { value: "50K+", label: "Investidores Ativos" },
  { value: "R$ 2.5B+", label: "Sob Análise" },
  { value: "98%", label: "Satisfação" },
  { value: "24/7", label: "Suporte IA" },
];

const integrations = {
  corretoras: [
    {
      name: "XP Investimentos",
      shortName: "XP",
      description: "Maior corretora do Brasil",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
      url: "https://www.xpi.com.br",
    },
    {
      name: "BTG Pactual",
      shortName: "BTG",
      description: "Banco de investimentos líder",
      textColor: "text-blue-600",
      bgColor: "bg-blue-500/10",
      url: "https://www.btgpactual.com",
    },
    {
      name: "Rico",
      shortName: "Rico",
      description: "Investimentos simplificados",
      textColor: "text-orange-500",
      bgColor: "bg-orange-500/10",
      url: "https://www.rico.com.vc",
    },
    {
      name: "Clear",
      shortName: "Clear",
      description: "Corretagem zero",
      textColor: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      url: "https://www.clear.com.br",
    },
    {
      name: "NuInvest",
      shortName: "Nu",
      description: "Investimentos do Nubank",
      textColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
      url: "https://www.nuinvest.com.br",
    },
    {
      name: "Inter",
      shortName: "Inter",
      description: "Super app financeiro",
      textColor: "text-orange-600",
      bgColor: "bg-orange-600/10",
      url: "https://www.bancointer.com.br",
    },
  ],
  mercado: [
    {
      name: "B3",
      shortName: "B3",
      description: "Bolsa de Valores do Brasil",
      textColor: "text-blue-600",
      bgColor: "bg-blue-500/10",
      url: "https://www.b3.com.br",
    },
    {
      name: "CVM",
      shortName: "CVM",
      description: "Comissão de Valores Mobiliários",
      textColor: "text-green-600",
      bgColor: "bg-green-600/10",
      url: "https://www.gov.br/cvm",
    },
    {
      name: "Tesouro Direto",
      shortName: "TD",
      description: "Títulos públicos federais",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      url: "https://www.tesourodireto.com.br",
    },
    {
      name: "ANBIMA",
      shortName: "ANBIMA",
      description: "Associação de mercados",
      textColor: "text-slate-600",
      bgColor: "bg-slate-500/10",
      url: "https://www.anbima.com.br",
    },
  ],
};

const features = [
  {
    icon: Bot,
    title: "IA Conversacional Avançada",
    description: "Converse naturalmente sobre investimentos em português. Nossa IA entende contexto, gírias e expressões regionais para oferecer análises personalizadas.",
    highlight: "GPT-4 Treinado em PT-BR",
  },
  {
    icon: LineChart,
    title: "Análise Preditiva",
    description: "Modelos de machine learning que identificam padrões e tendências antes do mercado, auxiliando suas decisões com dados concretos.",
    highlight: "85% de Precisão",
  },
  {
    icon: Shield,
    title: "Gestão de Risco Inteligente",
    description: "Análise de risco personalizada para seu perfil, com alertas inteligentes e sugestões automáticas de proteção do patrimônio.",
    highlight: "Monitoramento 24/7",
  },
  {
    icon: PieChart,
    title: "Diversificação Automática",
    description: "Sugestões inteligentes de alocação baseadas em seu perfil de investidor, horizonte de tempo e objetivos financeiros.",
    highlight: "Rebalanceamento Smart",
  },
  {
    icon: Bell,
    title: "Alertas Personalizados",
    description: "Notificações em tempo real sobre movimentações relevantes, oportunidades de mercado e eventos que impactam seus ativos.",
    highlight: "Tempo Real",
  },
  {
    icon: Brain,
    title: "Aprendizado Contínuo",
    description: "A IA aprende com suas decisões e preferências, melhorando continuamente as recomendações ao seu perfil único.",
    highlight: "IA Adaptativa",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Crie sua Conta Gratuita",
    description: "Cadastro simples e rápido. Em menos de 2 minutos você já está dentro da plataforma.",
    icon: Users,
  },
  {
    step: "02",
    title: "Defina seu Perfil de Investidor",
    description: "Nossa IA faz perguntas inteligentes para entender seu momento de vida, objetivos e tolerância a risco.",
    icon: Target,
  },
  {
    step: "03",
    title: "Conecte suas Carteiras",
    description: "Integre suas contas de corretoras ou adicione manualmente seus ativos para análise completa.",
    icon: Wallet,
  },
  {
    step: "04",
    title: "Receba Insights Personalizados",
    description: "A IA analisa seu portfólio e oferece recomendações, alertas e oportunidades sob medida.",
    icon: Sparkles,
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Economize Tempo",
    description: "Análises que levariam horas são feitas em segundos pela nossa IA.",
  },
  {
    icon: TrendingUp,
    title: "Melhores Retornos",
    description: "Usuários reportam aumento médio de 23% na rentabilidade da carteira.",
  },
  {
    icon: Lock,
    title: "Segurança Total",
    description: "Criptografia de ponta, LGPD compliant e dados nunca compartilhados.",
  },
  {
    icon: Globe,
    title: "Mercado Global",
    description: "Acompanhe ativos brasileiros e internacionais em um só lugar.",
  },
];

const testimonials = [
  {
    name: "Carlos Eduardo Silva",
    role: "Engenheiro de Software",
    location: "São Paulo, SP",
    image: "/testimonials/user1.jpg",
    content: "A Zenith mudou completamente minha relação com investimentos. Antes eu perdia horas analisando planilhas, agora a IA faz isso por mim e ainda me explica tudo de forma simples.",
    rating: 5,
    portfolioGrowth: "+34%",
  },
  {
    name: "Marina Oliveira",
    role: "Médica",
    location: "Rio de Janeiro, RJ",
    image: "/testimonials/user2.jpg",
    content: "Como profissional com pouco tempo, a Zenith é perfeita. Recebo alertas apenas quando realmente importa e as explicações são claras mesmo para quem não é do mercado financeiro.",
    rating: 5,
    portfolioGrowth: "+28%",
  },
  {
    name: "Roberto Mendes",
    role: "Empresário",
    location: "Belo Horizonte, MG",
    image: "/testimonials/user3.jpg",
    content: "Já usei várias plataformas, mas nenhuma tinha uma IA que realmente entende o mercado brasileiro. As recomendações de FIIs são excepcionais.",
    rating: 5,
    portfolioGrowth: "+41%",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Grátis",
    description: "Para quem está começando sua jornada de investimentos",
    features: [
      "Carteira com até 10 ativos",
      "Análises básicas de mercado",
      "Alertas de preço limitados",
      "Chat IA (50 mensagens/mês)",
      "Dashboard básico",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Smart",
    price: "R$ 29,90",
    period: "/mês",
    description: "Para investidores que querem ir além do básico",
    features: [
      "Carteira ilimitada",
      "Análises avançadas com IA",
      "Alertas ilimitados personalizados",
      "Chat IA ilimitado",
      "Relatórios mensais detalhados",
      "Sugestões de rebalanceamento",
    ],
    cta: "Assinar Smart",
    popular: true,
  },
  {
    name: "Pro",
    price: "R$ 79,90",
    period: "/mês",
    description: "Para investidores experientes e exigentes",
    features: [
      "Tudo do plano Smart",
      "Análise preditiva avançada",
      "Backtesting de estratégias",
      "API para integrações",
      "Suporte prioritário",
      "Múltiplas carteiras",
      "Relatórios customizados",
    ],
    cta: "Assinar Pro",
    popular: false,
  },
];

const faqs = [
  {
    question: "A Zenith é uma corretora de valores?",
    answer: "Não. A Zenith é uma plataforma de análise e gestão de investimentos com inteligência artificial. Não realizamos operações de compra e venda. Você continua operando pela sua corretora preferida, e nós fornecemos as análises e recomendações.",
  },
  {
    question: "Minhas informações financeiras estão seguras?",
    answer: "Absolutamente. Utilizamos criptografia de ponta a ponta (AES-256), somos compliant com a LGPD e não compartilhamos seus dados com terceiros. Seus dados são armazenados em servidores seguros no Brasil.",
  },
  {
    question: "A IA pode operar automaticamente por mim?",
    answer: "Não. A Zenith fornece análises, alertas e recomendações, mas todas as decisões de investimento são suas. Acreditamos que você deve sempre ter controle total sobre seu patrimônio.",
  },
  {
    question: "Preciso ter experiência em investimentos?",
    answer: "Não! Nossa IA foi desenvolvida para atender desde iniciantes até investidores experientes. A linguagem se adapta ao seu nível de conhecimento, e você pode fazer perguntas em português simples.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem multa ou burocracia. Seu acesso continua até o final do período já pago.",
  },
  {
    question: "Quais tipos de ativos a plataforma analisa?",
    answer: "Analisamos ações brasileiras (B3), FIIs, ETFs, BDRs, Renda Fixa (Tesouro Direto, CDBs, LCIs, LCAs), Criptomoedas e ações internacionais. Nossa cobertura está sempre em expansão.",
  },
];

const footerLinks = {
  produto: [
    { label: "Recursos", href: "#features" },
    { label: "Preços", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Integrações", href: "#" },
  ],
  empresa: [
    { label: "Sobre Nós", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Imprensa", href: "#" },
  ],
  legal: [
    { label: "Termos de Uso", href: "#" },
    { label: "Política de Privacidade", href: "#" },
    { label: "LGPD", href: "#" },
    { label: "Disclaimer", href: "#" },
  ],
  suporte: [
    { label: "Central de Ajuda", href: "#" },
    { label: "Contato", href: "#contact" },
    { label: "Status", href: "#" },
    { label: "API Docs", href: "#" },
  ],
};

// ============================================================================
// COMPONENTS
// ============================================================================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterLoading) return;

    setNewsletterLoading(true);
    setNewsletterMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewsletterMessage({ type: "success", text: data.message });
        setNewsletterEmail("");
      } else {
        setNewsletterMessage({ type: "error", text: data.detail || "Erro ao processar inscricao." });
      }
    } catch {
      setNewsletterMessage({ type: "error", text: "Erro de conexao. Tente novamente." });
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ================================================================== */}
      {/* HEADER / NAVIGATION */}
      {/* ================================================================== */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">Zenith</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Button asChild>
              <Link href="/auth/register">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 flex flex-col gap-4">
              <Link href="#features" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Recursos
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Como Funciona
              </Link>
              <Link href="#pricing" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Preços
              </Link>
              <Link href="#faq" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
              <hr className="border-border" />
              <Link href="/auth/login" className="text-sm font-medium py-2">
                Entrar
              </Link>
              <Button asChild className="w-full">
                <Link href="/auth/register">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ================================================================ */}
        {/* HERO SECTION */}
        {/* ================================================================ */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Gradient with Animation */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          <div className="container">
            <motion.div
              className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Badge */}
              <motion.div variants={fadeInDown}>
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                  </motion.span>
                  Inteligencia Artificial para seus Investimentos
                </Badge>
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                variants={fadeInUp}
              >
                Invista com inteligencia,
                <br />
                <motion.span
                  className="text-primary inline-block"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{
                    backgroundSize: "200% auto",
                    backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.7), hsl(var(--primary)))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  cresça com confiança
                </motion.span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                className="max-w-2xl text-lg md:text-xl text-muted-foreground"
                variants={fadeInUp}
              >
                Transformamos qualquer brasileiro em um investidor sofisticado
                através de IA que entende seu contexto, fala sua língua e evolui
                com seus objetivos de vida.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                variants={fadeInUp}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="text-base px-8 w-full sm:w-auto" asChild>
                    <Link href="/auth/register">
                      Começar Gratuitamente
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="text-base px-8 w-full sm:w-auto" asChild>
                    <Link href="#how-it-works">
                      Ver Como Funciona
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Social Proof Quick Stats */}
              <motion.div
                className="flex flex-wrap justify-center gap-8 md:gap-12 pt-8 border-t border-border/50 mt-4 w-full"
                variants={fadeInUp}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* INTEGRATIONS SECTION */}
        {/* ================================================================ */}
        <section className="py-16 md:py-24 border-y bg-gradient-to-b from-muted/50 to-background">
          <div className="container">
            {/* Section Header */}
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Link2 className="h-4 w-4" />
                </motion.span>
                Integrações em Tempo Real
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Conectado com o mercado financeiro brasileiro
              </h2>
              <p className="text-lg text-muted-foreground">
                Dados atualizados em tempo real das principais corretoras e instituições do Brasil
              </p>
            </AnimatedSection>

            {/* Corretoras */}
            <AnimatedSection className="mb-12" delay={0.2}>
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Building2 className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-semibold">Corretoras Integradas</h3>
                  <p className="text-sm text-muted-foreground">Sincronize sua carteira automaticamente</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {integrations.corretoras.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-card rounded-xl border p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Logo */}
                    <motion.div
                      className={`h-12 w-12 rounded-lg ${item.bgColor} flex items-center justify-center mb-3`}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                    >
                      <span className={`text-lg font-bold ${item.textColor}`}>
                        {item.shortName}
                      </span>
                    </motion.div>

                    {/* Name */}
                    <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>

                    {/* Connection Status */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.a>
                ))}
              </div>
            </AnimatedSection>

            {/* Dados de Mercado */}
            <AnimatedSection delay={0.3}>
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Landmark className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-semibold">Dados de Mercado</h3>
                  <p className="text-sm text-muted-foreground">Informações oficiais e regulamentadas</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {integrations.mercado.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-card rounded-xl border p-5 hover:shadow-lg hover:border-primary/50 transition-colors cursor-pointer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      {/* Logo */}
                      <motion.div
                        className={`h-14 w-14 rounded-xl ${item.bgColor} flex items-center justify-center`}
                        whileHover={{ scale: 1.15, rotate: -5 }}
                      >
                        <span className={`text-xl font-bold ${item.textColor}`}>
                          {item.shortName}
                        </span>
                      </motion.div>

                      {/* External Link Icon */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>

                    {/* Name & Description */}
                    <h4 className="font-semibold mb-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>

                    {/* Status Badge */}
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                        <span className="relative flex h-1.5 w-1.5 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Conectado
                      </Badge>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.a>
                ))}
              </div>
            </AnimatedSection>

            {/* Bottom Stats */}
            <AnimatedSection className="mt-12 pt-8 border-t" delay={0.4}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <motion.div whileHover={{ scale: 1.1 }} className="cursor-default">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">10+</div>
                  <div className="text-sm text-muted-foreground">Corretoras Integradas</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="cursor-default">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">1M+</div>
                  <div className="text-sm text-muted-foreground">Ativos Monitorados</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="cursor-default">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{"<"}1s</div>
                  <div className="text-sm text-muted-foreground">Latência de Dados</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="cursor-default">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime Garantido</div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FEATURES SECTION */}
        {/* ================================================================ */}
        <section id="features" className="py-20 md:py-32">
          <div className="container">
            {/* Section Header */}
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge variant="outline" className="mb-4">Recursos</Badge>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Tecnologia de ponta para seus investimentos
              </h2>
              <p className="text-lg text-muted-foreground">
                Recursos avançados de inteligência artificial que transformam a forma como você investe
              </p>
            </AnimatedSection>

            {/* Features Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative rounded-2xl border bg-card p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <motion.div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <feature.icon className="h-7 w-7 text-primary" />
                  </motion.div>

                  {/* Highlight Badge */}
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {feature.highlight}
                  </Badge>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>

                  {/* Animated border on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-primary/0 pointer-events-none"
                    whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* HOW IT WORKS SECTION */}
        {/* ================================================================ */}
        <section id="how-it-works" className="py-20 md:py-32 bg-muted/50">
          <div className="container">
            {/* Section Header */}
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge variant="outline" className="mb-4">Como Funciona</Badge>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Comece a investir de forma inteligente em 4 passos
              </h2>
              <p className="text-lg text-muted-foreground">
                Processo simples e rápido para transformar sua jornada de investimentos
              </p>
            </AnimatedSection>

            {/* Steps */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  {/* Connector Line (desktop) - Animated */}
                  {index < howItWorks.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-primary/30 -translate-x-1/2 z-0"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                      style={{ originX: 0 }}
                    />
                  )}

                  <motion.div
                    className="relative bg-card rounded-2xl p-6 border shadow-sm"
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Step Number */}
                    <motion.div
                      className="absolute -top-4 left-6 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.2, type: "spring", stiffness: 200 }}
                    >
                      {item.step}
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      className="mt-4 mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className="h-6 w-6 text-primary" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <AnimatedSection className="text-center mt-12" delay={0.5}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Criar Minha Conta Agora
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* ================================================================ */}
        {/* BENEFITS SECTION */}
        {/* ================================================================ */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              {/* Left - Content */}
              <AnimatedSection>
                <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                  <Badge variant="outline" className="mb-4">Vantagens</Badge>
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Por que milhares de investidores escolhem a Zenith?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Nossa plataforma combina o melhor da tecnologia com expertise em mercado financeiro brasileiro para entregar resultados reais.
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-primary/10"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Right - Stats Card */}
              <AnimatedSection delay={0.3}>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="bg-card rounded-3xl border shadow-xl p-8 md:p-10"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div
                        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </motion.div>
                      <div>
                        <div className="text-sm text-muted-foreground">Retorno médio dos usuários</div>
                        <motion.div
                          className="text-3xl font-bold text-positive"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                        >
                          +23.5%
                        </motion.div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "Ações", value: "+31.2%" },
                        { label: "FIIs", value: "+18.7%" },
                        { label: "Renda Fixa", value: "+14.3%" },
                        { label: "Cripto", value: "+42.8%" },
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          className={`flex justify-between items-center py-3 ${idx < 3 ? "border-b" : ""}`}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ x: 5, backgroundColor: "hsl(var(--muted) / 0.3)" }}
                        >
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold text-positive">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground mt-6">
                      *Média baseada em dados de usuários no período de 12 meses. Rentabilidade passada não garante rentabilidade futura.
                    </p>
                  </motion.div>

                  {/* Decorative Elements */}
                  <motion.div
                    className="absolute -z-10 -top-4 -right-4 h-full w-full rounded-3xl bg-primary/5"
                    animate={{ rotate: [0, 1, -1, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* TESTIMONIALS SECTION */}
        {/* ================================================================ */}
        <section className="py-20 md:py-32 bg-muted/50">
          <div className="container">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Depoimentos</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                O que nossos investidores dizem
              </h2>
              <p className="text-lg text-muted-foreground">
                Histórias reais de pessoas que transformaram sua forma de investir
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm"
                >
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground mb-6">&ldquo;{testimonial.content}&rdquo;</p>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-positive">{testimonial.portfolioGrowth}</div>
                      <div className="text-xs text-muted-foreground">em 12 meses</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* PRICING SECTION */}
        {/* ================================================================ */}
        <section id="pricing" className="py-20 md:py-32">
          <div className="container">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Preços</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Planos para cada fase da sua jornada
              </h2>
              <p className="text-lg text-muted-foreground">
                Comece gratuitamente e evolua conforme suas necessidades crescem
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl border bg-card p-6 md:p-8 shadow-sm ${
                    plan.popular ? 'border-primary shadow-lg scale-105' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/auth/register">{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* Enterprise Note */}
            <div className="text-center mt-12">
              <p className="text-muted-foreground">
                Precisa de um plano empresarial?{' '}
                <Link href="#contact" className="text-primary hover:underline font-medium">
                  Fale conosco
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FAQ SECTION */}
        {/* ================================================================ */}
        <section id="faq" className="py-20 md:py-32 bg-muted/50">
          <div className="container max-w-3xl">
            {/* Section Header */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Tudo que você precisa saber sobre a Zenith
              </p>
            </div>

            {/* FAQ Items */}
            <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>

            {/* More Questions */}
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Ainda tem dúvidas?{' '}
                <Link href="#contact" className="text-primary hover:underline font-medium">
                  Entre em contato
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FINAL CTA SECTION */}
        {/* ================================================================ */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />

          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                Pronto para transformar seus investimentos?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Junte-se a mais de 50 mil investidores brasileiros que já estão
                usando inteligência artificial para tomar melhores decisões.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-base px-8" asChild>
                  <Link href="/auth/register">
                    Criar Minha Conta Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8" asChild>
                  <Link href="#pricing">Ver Planos</Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Dados Criptografados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>LGPD Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Sem Cartão de Crédito</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CONTACT SECTION */}
        {/* ================================================================ */}
        <section id="contact" className="py-20 border-t bg-muted/30">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              {/* Newsletter */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4">
                  Receba insights semanais sobre o mercado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Newsletter gratuita com análises e oportunidades identificadas pela nossa IA.
                </p>
                <form className="flex gap-2 max-w-md" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterLoading}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    required
                  />
                  <Button type="submit" disabled={newsletterLoading}>
                    {newsletterLoading ? "..." : "Assinar"}
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                {newsletterMessage && (
                  <p className={`mt-2 text-sm ${newsletterMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {newsletterMessage.text}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contato</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>contato@zenith.com.br</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>(11) 4000-0000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>São Paulo, SP - Brasil</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
                <div className="flex gap-4">
                  <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className="border-t py-12 md:py-16">
        <div className="container">
          {/* Footer Links */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Zenith</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Inteligência artificial para investidores brasileiros.
              </p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2">
                {footerLinks.produto.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2">
                {footerLinks.empresa.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2">
                {footerLinks.suporte.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Zenith. Todos os direitos reservados.
              </p>
              <p className="text-xs text-muted-foreground text-center md:text-right max-w-xl">
                A Zenith não é uma instituição financeira e não realiza recomendações de investimentos.
                Todo conteúdo é informativo. Consulte um profissional certificado antes de investir.
                Rentabilidade passada não garante rentabilidade futura.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
