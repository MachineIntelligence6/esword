"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import Link from "next/link";
import { useState } from "react";
import { ApiResCode, ApiResponse } from "@/shared/types/api.types";

export const forgotPasswordFormSchema = z
  .object({
    email: z
      .string({ required_error: "This field is required." })
      .min(1, { message: "This field is required." })
      .email({ message: "Please enter a valid email address." }),
    password: z
      .string({ required_error: "This field is required." })
      .min(8, { message: "Password must contain at least 8 characters." }),
    confirmPassword: z
      .string({ required_error: "This field is required." })
      .min(8, { message: "Password must contain at least 8 characters." }),
    recoverySecret: z
      .string({ required_error: "This field is required." })
      .min(1, { message: "This field is required." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ForgotPasswordFormSchema = z.infer<typeof forgotPasswordFormSchema>;

export default function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const form = useForm<ForgotPasswordFormSchema>({
    resolver: zodResolver(forgotPasswordFormSchema),
    mode: "all",
  });

  const handleFormSubmit = async (data: ForgotPasswordFormSchema) => {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        recoverySecret: data.recoverySecret,
      }),
    });
    const res = (await response.json()) as ApiResponse<null>;
    if (!res.succeed) {
      const code = res.code as ApiResCode;
      const message =
        code === "VALIDATION_ERROR"
          ? "Please check the form and try again."
          : code === "INVALID_CREDENTIALS"
            ? "Unable to reset password. Check your email and recovery key."
            : definedMessages.UNKNOWN_ERROR;
      form.setError("recoverySecret", { message });
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-700">
          Password updated. You can sign in with your new password.
        </p>
        <Button asChild variant="primary">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                {fieldState.error && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  New password <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter a new password"
                    {...field}
                  />
                </FormControl>
                {fieldState.error && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Confirm password <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    {...field}
                  />
                </FormControl>
                {fieldState.error && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recoverySecret"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Recovery key <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="off"
                    placeholder="Enter the account recovery key"
                    {...field}
                  />
                </FormControl>
                {fieldState.error && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>

        <div className="mt-5 mb-5 flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Spinner className="border-white" />
            ) : (
              <span>Reset password</span>
            )}
          </Button>
          <Link
            href="/login"
            className="text-center text-sm font-semibold text-primary-dark"
          >
            Back to login
          </Link>
        </div>
      </form>
    </Form>
  );
}
