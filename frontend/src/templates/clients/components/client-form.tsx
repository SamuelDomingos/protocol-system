"use client";

import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Loader2, Save, X } from "lucide-react";
import { useClientForm } from "../hooks/useClientForm";
import type { ClientFormProps } from "../types";

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const { form, isLoading, error, onSubmit, isEditing } = useClientForm({
    client,
    onSuccess,
    onCancel,
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Cliente" : "Novo Cliente"}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? "Atualize as informações do cliente" 
            : "Preencha os dados para criar um novo cliente"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome completo"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(XX) XXXXX-XXXX"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Formatação automática do telefone
                          const formatted = value
                            .replace(/\D/g, "")
                            .replace(/^(\d{2})(\d)/g, "($1) $2")
                            .replace(/(\d{4,5})(\d{4})/, "$1-$2");
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CPF */}
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XXX.XXX.XXX-XX"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Formatação automática do CPF
                          const formatted = value
                            .replace(/\D/g, "")
                            .replace(/^(\d{3})(\d)/, "$1.$2")
                            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
                            .replace(/\.(\d{3})(\d{2})$/, ".$1-$2");
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite observações sobre o cliente (opcional)"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? "Atualizar" : "Criar"} Cliente
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
