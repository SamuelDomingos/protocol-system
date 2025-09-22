"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import type { LoginRequest } from "@/src/lib/api/types";

interface UseLoginFormReturn {
  formData: LoginRequest;
  isSubmitting: boolean;
  error: string | null;
  handleInputChange: (field: keyof LoginRequest, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

export function useLoginForm(): UseLoginFormReturn {
  const router = useRouter();
  const { login, error: authError, clearError: clearAuthError } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpa o erro quando o usuário começa a digitar
    if (authError) {
      clearAuthError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      clearAuthError();
      await login(formData);

      router.push("/dashboard");
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    error: authError,
    handleInputChange,
    handleSubmit,
    clearError: clearAuthError,
  };
}
