import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  full_name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, "").length >= 10,
      "Telefone deve ter no mínimo 10 dígitos"
    ),
  cpf: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, "").length === 11,
      "CPF deve ter 11 dígitos"
    ),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter letras maiúsculas, minúsculas e números"
    ),
  confirm_password: z
    .string()
    .min(1, "Confirme sua senha"),
  accepted_terms: z
    .boolean()
    .refine((val) => val === true, "Você deve aceitar os termos de uso"),
}).refine((data) => data.password === data.confirm_password, {
  message: "As senhas não coincidem",
  path: ["confirm_password"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
