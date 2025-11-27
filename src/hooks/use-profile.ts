"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface InvestorProfile {
  id: number;
  user_id: number;
  risk_profile: "conservative" | "moderate" | "balanced" | "growth" | "aggressive";
  risk_score: number;
  investment_horizon: string;
  primary_goals: string[];
  monthly_income: string | null;
  monthly_investment: string | null;
  total_patrimony: string | null;
  experience_level: string;
  created_at: string;
  updated_at: string | null;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: { value: number; label: string }[];
  category: string;
}

export interface AssessmentStartResponse {
  session_id: string;
  total_questions: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  risk_profile: string;
  risk_score: number;
  risk_description: string;
  recommended_allocation: Record<string, number>;
}

async function fetchProfile(): Promise<InvestorProfile> {
  const response = await api.get("/profile/");
  return response.data;
}

async function startAssessment(): Promise<AssessmentStartResponse> {
  const response = await api.post("/profile/assessment/start");
  return response.data;
}

async function submitAssessment(data: {
  session_id: string;
  answers: Record<string, number>;
}): Promise<AssessmentResult> {
  const response = await api.post("/profile/assessment/submit", data);
  return response.data;
}

export function useInvestorProfile() {
  return useQuery({
    queryKey: ["investor-profile"],
    queryFn: fetchProfile,
    retry: false,
  });
}

// Check if user has completed profile (for onboarding redirect)
export async function checkProfileExists(): Promise<boolean> {
  try {
    await api.get("/profile/");
    return true;
  } catch {
    return false;
  }
}

// Get risk profile label in Portuguese
export function getRiskProfileLabel(
  riskProfile: "conservative" | "moderate" | "balanced" | "growth" | "aggressive"
): string {
  const labels: Record<string, string> = {
    conservative: "Conservador",
    moderate: "Moderado",
    balanced: "Balanceado",
    growth: "Arrojado",
    aggressive: "Agressivo",
  };
  return labels[riskProfile] || riskProfile;
}

export function useStartAssessment() {
  return useMutation({
    mutationFn: startAssessment,
  });
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investor-profile"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}
