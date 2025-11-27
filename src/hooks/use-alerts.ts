"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type AlertCondition = "above" | "below";

export interface PriceAlert {
  id: number;
  ticker: string;
  target_price: number;
  condition: AlertCondition;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  triggered_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PriceAlertListResponse {
  alerts: PriceAlert[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateAlertData {
  ticker: string;
  target_price: number;
  condition: AlertCondition;
  notes?: string;
}

export interface UpdateAlertData {
  target_price?: number;
  condition?: AlertCondition;
  is_active?: boolean;
  notes?: string;
}

interface AlertFilters {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
  ticker?: string;
}

async function fetchAlerts(filters: AlertFilters): Promise<PriceAlertListResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page || 1,
    page_size: filters.pageSize || 20,
  };
  if (filters.isActive !== undefined) params.is_active = filters.isActive;
  if (filters.ticker) params.ticker = filters.ticker;

  const response = await api.get("/alerts/", { params });
  return response.data;
}

async function createAlert(data: CreateAlertData): Promise<PriceAlert> {
  const response = await api.post("/alerts/", data);
  return response.data;
}

async function updateAlert({
  id,
  data,
}: {
  id: number;
  data: UpdateAlertData;
}): Promise<PriceAlert> {
  const response = await api.patch(`/alerts/${id}`, data);
  return response.data;
}

async function deleteAlert(id: number): Promise<void> {
  await api.delete(`/alerts/${id}`);
}

export function useAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: ["alerts", filters],
    queryFn: () => fetchAlerts(filters),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
