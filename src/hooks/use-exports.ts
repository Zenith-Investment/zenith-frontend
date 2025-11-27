"use client";

import api from "@/lib/api";

export type ExportFormat = "excel" | "csv";

export async function exportPortfolio(format: ExportFormat): Promise<void> {
  const endpoint = format === "excel" ? "/exports/portfolio/excel" : "/exports/portfolio/csv";
  const response = await api.get(endpoint, {
    responseType: "blob",
  });

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers["content-disposition"];
  let filename = `carteira.${format === "excel" ? "xlsx" : "csv"}`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename=(.+)/);
    if (match) {
      filename = match[1];
    }
  }

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportTransactions(
  format: ExportFormat,
  startDate?: string,
  endDate?: string
): Promise<void> {
  const endpoint = format === "excel" ? "/exports/transactions/excel" : "/exports/transactions/csv";

  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await api.get(endpoint, {
    params,
    responseType: "blob",
  });

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers["content-disposition"];
  let filename = `transacoes.${format === "excel" ? "xlsx" : "csv"}`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename=(.+)/);
    if (match) {
      filename = match[1];
    }
  }

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
