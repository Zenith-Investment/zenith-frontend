"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type TransactionType = "buy" | "sell" | "dividend" | "split";

export interface Transaction {
  id: number;
  asset_id: number;
  ticker: string;
  asset_class: string;
  transaction_type: TransactionType;
  quantity: number;
  price: number;
  total_value: number;
  fees: number;
  transaction_date: string;
  notes: string | null;
  created_at: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateTransactionData {
  asset_id: number;
  transaction_type: TransactionType;
  quantity: number;
  price: number;
  fees?: number;
  transaction_date: string;
  notes?: string;
}

interface TransactionFilters {
  page?: number;
  pageSize?: number;
  assetId?: number;
  transactionType?: TransactionType;
}

async function fetchTransactions(
  filters: TransactionFilters
): Promise<TransactionListResponse> {
  const params: Record<string, string | number> = {
    page: filters.page || 1,
    page_size: filters.pageSize || 20,
  };
  if (filters.assetId) params.asset_id = filters.assetId;
  if (filters.transactionType) params.transaction_type = filters.transactionType;

  const response = await api.get("/transactions/", { params });
  return response.data;
}

async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  const response = await api.post("/transactions/", data);
  return response.data;
}

async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
