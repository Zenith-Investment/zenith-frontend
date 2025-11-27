import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "Zenith - Empowering Smart Investments for Everyone",
    template: "%s | Zenith",
  },
  description:
    "Transformamos qualquer brasileiro em um investidor sofisticado através de IA que entende seu contexto, fala sua língua e evolui com seus objetivos. Análise de ações, FIIs, renda fixa e mais com inteligência artificial.",
  keywords: [
    "investimentos",
    "inteligência artificial",
    "IA para investimentos",
    "carteira de investimentos",
    "ações",
    "fundos imobiliários",
    "FIIs",
    "renda fixa",
    "análise de mercado",
    "análise preditiva",
    "machine learning",
    "investir com IA",
    "gestão de portfólio",
    "investimentos Brasil",
    "B3",
    "tesouro direto",
    "ETFs",
    "BDRs",
    "criptomoedas",
    "diversificação",
    "análise técnica",
    "análise fundamentalista",
  ],
  authors: [{ name: "Zenith", url: "https://zenith.com.br" }],
  creator: "Zenith",
  publisher: "Zenith",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://zenith.com.br"),
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
    },
  },
  openGraph: {
    title: "Zenith - Empowering Smart Investments for Everyone",
    description:
      "Sua assistente de investimentos pessoal com inteligência artificial. Análise de ações, FIIs, renda fixa e mais. Comece gratuitamente!",
    url: "https://zenith.com.br",
    siteName: "Zenith",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zenith - Empowering Smart Investments for Everyone",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenith - Empowering Smart Investments for Everyone",
    description:
      "Transforme sua forma de investir com IA. Análises personalizadas, alertas inteligentes e recomendações sob medida.",
    images: ["/twitter-image.png"],
    creator: "@zenith",
    site: "@zenith",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "Finance",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Zenith",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Plataforma de análise e gestão de investimentos com inteligência artificial para o mercado brasileiro.",
  url: "https://zenith.com.br",
  author: {
    "@type": "Organization",
    name: "Zenith",
    url: "https://zenith.com.br",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "BRL",
    lowPrice: "0",
    highPrice: "79.90",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "5000",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Análise de investimentos com IA",
    "Chat conversacional em português",
    "Alertas personalizados",
    "Gestão de risco",
    "Análise preditiva",
    "Diversificação automática",
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zenith",
  url: "https://zenith.com.br",
  logo: "https://zenith.com.br/logo.png",
  sameAs: [
    "https://twitter.com/zenith",
    "https://linkedin.com/company/zenith",
    "https://instagram.com/zenith",
    "https://youtube.com/@zenith",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-11-4000-0000",
    contactType: "customer service",
    availableLanguage: "Portuguese",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    addressCountry: "BR",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "A Zenith é uma corretora de valores?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. A Zenith é uma plataforma de análise e gestão de investimentos com inteligência artificial. Não realizamos operações de compra e venda. Você continua operando pela sua corretora preferida, e nós fornecemos as análises e recomendações.",
      },
    },
    {
      "@type": "Question",
      name: "Minhas informações financeiras estão seguras?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutamente. Utilizamos criptografia de ponta a ponta (AES-256), somos compliant com a LGPD e não compartilhamos seus dados com terceiros. Seus dados são armazenados em servidores seguros no Brasil.",
      },
    },
    {
      "@type": "Question",
      name: "A IA pode operar automaticamente por mim?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. A Zenith fornece análises, alertas e recomendações, mas todas as decisões de investimento são suas. Acreditamos que você deve sempre ter controle total sobre seu patrimônio.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso ter experiência em investimentos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não! Nossa IA foi desenvolvida para atender desde iniciantes até investidores experientes. A linguagem se adapta ao seu nível de conhecimento, e você pode fazer perguntas em português simples.",
      },
    },
    {
      "@type": "Question",
      name: "Quais tipos de ativos a plataforma analisa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Analisamos ações brasileiras (B3), FIIs, ETFs, BDRs, Renda Fixa (Tesouro Direto, CDBs, LCIs, LCAs), Criptomoedas e ações internacionais. Nossa cobertura está sempre em expansão.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
