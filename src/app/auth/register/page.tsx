"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accepted_terms: false,
    },
  });

  const acceptedTerms = watch("accepted_terms");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone?.replace(/\D/g, ""),
        cpf: data.cpf?.replace(/\D/g, ""),
        accepted_terms: data.accepted_terms,
      });
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Zenith.",
      });
      router.push("/onboarding/profile-assessment");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Zenith</span>
            </Link>
          </div>
          <CardTitle className="text-2xl">Criar sua conta</CardTitle>
          <CardDescription>
            Comece sua jornada de investimentos com IA
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                placeholder="Seu nome completo"
                autoComplete="name"
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                autoComplete="tel"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar senha</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Repita sua senha"
                autoComplete="new-password"
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="text-sm text-destructive">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="accepted_terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setValue("accepted_terms", checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="accepted_terms"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Aceito os termos de uso
                </label>
                <p className="text-sm text-muted-foreground">
                  Li e concordo com os{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </div>
            {errors.accepted_terms && (
              <p className="text-sm text-destructive">
                {errors.accepted_terms.message}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar conta
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
