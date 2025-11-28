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

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[^a-zA-Z0-9]/, "Password must have at least one special character (!@#$%^&* etc.)"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register: authRegister } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    try {
      const { toast } = await import('sonner')
      
      // Use auth context for registration
      await authRegister(data.name, data.email, data.password)
      
      // Show success message
      toast.success('Account created successfully! Welcome to ERP System.')
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
      
    } catch (error: any) {
      console.error("Signup failed:", error)
      
      const { toast } = await import('sonner')
      
      // Handle API validation errors
      if (error?.details?.errors) {
        const apiErrors = error.details.errors;
        
        // Show specific validation errors
        Object.entries(apiErrors).forEach(([field, message]: [string, any]) => {
          let errorMessage = Array.isArray(message) ? message[0] : message;
          
          // Map API field names to user-friendly messages
          switch (field) {
            case 'passwordRequiresNonAlphanumeric':
              errorMessage = 'Password must contain at least one special character (!@#$%^&* etc.)';
              break;
            case 'passwordRequiresLower':
              errorMessage = 'Password must contain at least one lowercase letter.';
              break;
            case 'passwordRequiresUpper':
              errorMessage = 'Password must contain at least one uppercase letter.';
              break;
            case 'passwordRequiresDigit':
              errorMessage = 'Password must contain at least one number.';
              break;
            case 'duplicateUserName':
            case 'duplicateEmail':
              errorMessage = 'An account with this email already exists.';
              break;
            default:
              // Use the message as is for other errors
              break;
          }
          
          toast.error(errorMessage);
        });
      } else {
        // Show general error message
        let errorMessage = 'Failed to create account. Please try again.';
        
        if (error?.code === 'NETWORK_ERROR') {
          errorMessage = 'Cannot connect to server. Please check if the API is running.';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ERP Branding Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">ERP System</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Join our Enterprise Resource Planning platform
        </p>
      </div>

      <Card {...props} className="border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className={cn(
                    "h-10",
                    errors.name && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.name && (
                  <FieldDescription className="text-destructive">
                    {errors.name.message}
                  </FieldDescription>
                )}
              </Field>

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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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
                <FieldDescription>
                  Must be at least 6 characters with special characters (!@#$%^&* etc.).
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    className={cn(
                      "h-10 pr-10",
                      errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <FieldDescription className="text-destructive">
                    {errors.confirmPassword.message}
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
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          
          <div className="mt-6 text-center">
            <FieldDescription>
              Already have an account?{" "}
              <Link 
                href="/login"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </FieldDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
