"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
export type ReportType = "portfolio" | "performance" | "tax" | "backtest" | "forecast";
export type ReportFormat = "csv" | "excel" | "json";

export interface ReportTypeInfo {
  type: string;
  name: string;
  description: string;
  available_formats: string[];
}

export interface ReportRequest {
  report_type: ReportType;
  format: ReportFormat;
  period_start?: string;
  period_end?: string;
  portfolio_ids?: number[];
  include_charts?: boolean;
  include_transactions?: boolean;
}

export function useReports() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportTypes, setReportTypes] = useState<ReportTypeInfo[]>([]);
  const { toast } = useToast();

  // Fetch available report types
  const fetchReportTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ reports: ReportTypeInfo[] }>("/reports/types");
      setReportTypes(response.data.reports);
      return response.data.reports;
    } catch (error) {
      toast({
        title: "Erro ao carregar tipos de relatorio",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Generate and download report
  const generateReport = useCallback(
    async (request: ReportRequest) => {
      try {
        setIsLoading(true);

        const response = await api.post("/reports/generate", request, {
          responseType: "blob",
        });

        // Get filename from content-disposition header
        const contentDisposition = response.headers["content-disposition"];
        let filename = `relatorio_${request.report_type}.${request.format === "excel" ? "xlsx" : request.format}`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename=(.+)/);
          if (match) {
            filename = match[1].replace(/"/g, "");
          }
        }

        // Create download link
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Relatorio gerado",
          description: `${filename} foi baixado com sucesso.`,
        });

        return true;
      } catch (error) {
        toast({
          title: "Erro ao gerar relatorio",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Get report type label in Portuguese
  const getReportTypeLabel = (type: ReportType): string => {
    const labels: Record<ReportType, string> = {
      portfolio: "Carteira",
      performance: "Performance",
      tax: "Imposto de Renda",
      backtest: "Backtests",
      forecast: "Previsoes",
    };
    return labels[type] || type;
  };

  // Get report type description
  const getReportTypeDescription = (type: ReportType): string => {
    const descriptions: Record<ReportType, string> = {
      portfolio: "Composicao atual da carteira com valores e alocacoes",
      performance: "Metricas de desempenho e retorno dos investimentos",
      tax: "Relatorio para declaracao de imposto de renda (IR)",
      backtest: "Historico de backtests realizados",
      forecast: "Historico de previsoes geradas",
    };
    return descriptions[type] || "";
  };

  // Get format label
  const getFormatLabel = (format: ReportFormat): string => {
    const labels: Record<ReportFormat, string> = {
      csv: "CSV",
      excel: "Excel (.xlsx)",
      json: "JSON",
    };
    return labels[format] || format;
  };

  return {
    isLoading,
    reportTypes,
    fetchReportTypes,
    generateReport,
    getReportTypeLabel,
    getReportTypeDescription,
    getFormatLabel,
  };
}
