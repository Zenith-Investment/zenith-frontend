"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Loader2,
  PieChart,
  TrendingUp,
  Receipt,
  BarChart3,
  LineChart,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReports, ReportType, ReportFormat } from "@/hooks/use-reports";

// Report type icons
const reportIcons: Record<ReportType, React.ReactNode> = {
  portfolio: <PieChart className="h-6 w-6" />,
  performance: <TrendingUp className="h-6 w-6" />,
  tax: <Receipt className="h-6 w-6" />,
  backtest: <BarChart3 className="h-6 w-6" />,
  forecast: <LineChart className="h-6 w-6" />,
};

// Format icons
const formatIcons: Record<ReportFormat, React.ReactNode> = {
  csv: <FileText className="h-4 w-4" />,
  excel: <FileSpreadsheet className="h-4 w-4" />,
  json: <FileJson className="h-4 w-4" />,
};

export default function ReportsPage() {
  const {
    isLoading,
    generateReport,
    getReportTypeLabel,
    getReportTypeDescription,
    getFormatLabel,
  } = useReports();

  // Form state
  const [selectedType, setSelectedType] = useState<ReportType>("portfolio");
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("excel");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    setPeriodEnd(today.toISOString().split("T")[0]);
    setPeriodStart(oneYearAgo.toISOString().split("T")[0]);
  }, []);

  // Handle generate report
  const handleGenerateReport = async () => {
    await generateReport({
      report_type: selectedType,
      format: selectedFormat,
      period_start: periodStart || undefined,
      period_end: periodEnd || undefined,
      include_charts: includeCharts,
      include_transactions: includeTransactions,
    });
  };

  const reportTypes: ReportType[] = ["portfolio", "performance", "tax", "backtest", "forecast"];
  const formats: ReportFormat[] = ["excel", "csv", "json"];

  return (
    <div className="flex flex-col">
      <Header
        title="Relatorios"
        description="Gere relatorios personalizados da sua carteira"
      />

      <div className="p-6 space-y-6">
        {/* Report Type Selection */}
        <div className="grid gap-4 md:grid-cols-5">
          {reportTypes.map((type) => (
            <Card
              key={type}
              className={`cursor-pointer transition-all ${
                selectedType === type
                  ? "border-primary ring-2 ring-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedType(type)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`p-3 rounded-lg ${
                      selectedType === type
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {reportIcons[type]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getReportTypeLabel(type)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getReportTypeDescription(type)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuracoes do Relatorio</CardTitle>
              <CardDescription>
                Personalize as opcoes do relatorio de {getReportTypeLabel(selectedType)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label>Formato do Arquivo</Label>
                <Select
                  value={selectedFormat}
                  onValueChange={(v) => setSelectedFormat(v as ReportFormat)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((format) => (
                      <SelectItem key={format} value={format}>
                        <div className="flex items-center gap-2">
                          {formatIcons[format]}
                          {getFormatLabel(format)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data Inicio
                  </Label>
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data Fim
                  </Label>
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Options */}
              {selectedFormat === "excel" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Incluir Graficos</Label>
                      <p className="text-sm text-muted-foreground">
                        Adicionar visualizacoes graficas ao relatorio
                      </p>
                    </div>
                    <Switch
                      checked={includeCharts}
                      onCheckedChange={setIncludeCharts}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Incluir Transacoes</Label>
                      <p className="text-sm text-muted-foreground">
                        Listar todas as transacoes do periodo
                      </p>
                    </div>
                    <Switch
                      checked={includeTransactions}
                      onCheckedChange={setIncludeTransactions}
                    />
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerateReport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Gerar Relatorio
              </Button>
            </CardContent>
          </Card>

          {/* Report Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {reportIcons[selectedType]}
                Relatorio de {getReportTypeLabel(selectedType)}
              </CardTitle>
              <CardDescription>
                {getReportTypeDescription(selectedType)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedType === "portfolio" && (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Este relatorio inclui:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Lista completa de ativos na carteira</li>
                      <li>Quantidade e preco medio de cada ativo</li>
                      <li>Valor atual e lucro/prejuizo</li>
                      <li>Alocacao por classe de ativo</li>
                      <li>Distribuicao por setor (acoes)</li>
                    </ul>
                  </div>
                )}

                {selectedType === "performance" && (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Este relatorio inclui:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Retorno total e anualizado</li>
                      <li>Comparacao com benchmarks (IBOV, CDI)</li>
                      <li>Metricas de risco (Sharpe, Volatilidade)</li>
                      <li>Historico de performance mensal</li>
                      <li>Maiores ganhos e perdas</li>
                    </ul>
                  </div>
                )}

                {selectedType === "tax" && (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Este relatorio inclui:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Posicao em 31/12 para declaracao</li>
                      <li>Ganhos de capital por operacao</li>
                      <li>Prejuizos a compensar</li>
                      <li>Dividendos e JCP recebidos</li>
                      <li>Operacoes isentas e tributaveis</li>
                    </ul>
                    <p className="text-yellow-600 dark:text-yellow-400 mt-4">
                      Importante: Este relatorio e apenas informativo. Consulte um contador para sua declaracao.
                    </p>
                  </div>
                )}

                {selectedType === "backtest" && (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Este relatorio inclui:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Historico de backtests realizados</li>
                      <li>Estrategias testadas e parametros</li>
                      <li>Resultados de cada simulacao</li>
                      <li>Comparativo de estrategias</li>
                      <li>Metricas de risco de cada teste</li>
                    </ul>
                  </div>
                )}

                {selectedType === "forecast" && (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Este relatorio inclui:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Historico de previsoes geradas</li>
                      <li>Previsoes por ativo</li>
                      <li>Nivel de confianca de cada previsao</li>
                      <li>Comparacao com precos realizados</li>
                      <li>Acuracia das previsoes passadas</li>
                    </ul>
                  </div>
                )}

                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Formato selecionado</p>
                  <div className="flex items-center gap-2 mt-2">
                    {formatIcons[selectedFormat]}
                    <span className="text-sm text-muted-foreground">
                      {getFormatLabel(selectedFormat)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
