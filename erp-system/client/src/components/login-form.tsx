"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Building2, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const { toast } = await import('sonner')
      
      // Use auth context for login
      await login(data.email, data.password)
      
      // Show success message
      toast.success('Login successful! Welcome to ERP System.')
      
      // Check for redirect parameter
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect') || '/'
      
      // Redirect to dashboard or intended page immediately
      window.location.href = redirect
      
    } catch (error: unknown) {
      console.error("Login failed:", error)
      
      // Import toast dynamically
      const { toast } = await import('sonner')
      
      // Show user-friendly error message
      let errorMessage = 'Login failed. Please try again.';
      
      const apiError = error as { code?: string; message?: string; status?: number };
      if (apiError?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (apiError?.code === 'NETWORK_ERROR') {
        errorMessage = 'Cannot connect to server. Please check if the API is running.';
      } else if (apiError?.message) {
        errorMessage = apiError.message;
      }
      
      // Show persistent error toast with longer duration
      toast.error(errorMessage, {
        duration: 5000, // Show for 5 seconds
        action: {
          label: 'Dismiss',
          onClick: () => {}
        }
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* ERP Branding Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">ERP System</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Enterprise Resource Planning Dashboard
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to access your ERP dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  {...register("email")}
                  className={cn(
                    "h-10",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.email && (
                  <FieldDescription className="text-destructive">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                    onClick={() => {
                      // TODO: Implement forgot password
                      console.log("Forgot password clicked")
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={cn(
                      "h-10 pr-10",
                      errors.password && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <FieldDescription className="text-destructive">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>

              <Field className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-10 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          
          <div className="mt-6 text-center">
            <FieldDescription>
              Don&apos;t have an account?{" "}
              <Link 
                href="/signup"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                Create account
              </Link>
            </FieldDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
