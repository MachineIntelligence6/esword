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
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { ApiResCode } from "@/shared/types/api.types";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export const loginFormSchema = z.object({
  email: z
    .string({ required_error: "This field is required." })
    .min(1, { message: "This field is required." })
    .email({ message: "please enter a valid email address" }),
  password: z
    .string({ required_error: "This field is required." })
    .min(8, { message: "Password must contain at least 8 characters" }),
});
export type LoginFormSchema = z.infer<typeof loginFormSchema>;

// Everyone starts on the reading page, or goes back to the page that asked them
// to sign in. Admins and editors open the dashboard from the profile menu.
// Only same-site paths are followed, so a crafted link can't send people elsewhere.
function afterLoginPath(callbackUrl: string | null) {
  if (!callbackUrl) return "/";
  try {
    const url = new URL(callbackUrl, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname.startsWith("/login")) return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    mode: "all",
  });
  const handleFormSubmit = async (data: LoginFormSchema) => {
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    if (res?.error) {
      const error = res.error as ApiResCode;
      form.setError("password", {
        message:
          error === "RATE_LIMITED"
            ? definedMessages.RATE_LIMITED
            : definedMessages.INVALID_CREDENTIALS,
      });
      return;
    }
    // A full page load, so the header picks up the new session. (router.push
    // followed by reload() reloaded /login instead, which sent admins and
    // editors to the dashboard even when they had opened the reading page.)
    window.location.assign(afterLoginPath(searchParams.get("callbackUrl")));
  };

  return (
    <div>
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
                      placeholder="Enter your Email here"
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
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
                    Password <span className="text-red-500">*</span>{" "}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="password"
                      placeholder="Enter your Password here"
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between py-5 items-center text-xs md:text-sm">
            <div className="flex gap-1">
              <Checkbox />
              <p className=" text-primary-dark font-semibold font-inter">
                <span>Remember me</span>
              </p>
            </div>
            <div>
              <Link
                className="text-primary-dark font-semibold font-inter"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <div className="mt-5 mb-5">
            <Button
              type="submit"
              variant="primary"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Spinner className="border-white" />
              ) : (
                <span>Login</span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
