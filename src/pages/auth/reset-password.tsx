import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";
import supabase from "@/lib/supabase";
import toast from "react-hot-toast";
import { AuthRoutes } from "@/constants";
import { resetPasswordSchema, type ResetPasswordData } from "@/lib/zod";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Password reset successfully");
    } catch (err) {
      console.error("Error during password reset:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Make sure you're using the link from your email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    if (errorMessage) setErrorMessage("");
  };

  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center px-4 md:px-6">
      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground">Enter your new password below</p>
        </div>
        <div className="grid gap-4 sm:gap-6">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
              {errorMessage}
            </div>
          )}
          {isSuccess ? (
            <>
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
                Your password has been reset successfully.
              </div>
              <Button className="mt-2" asChild>
                <Link to={AuthRoutes.Login}>Go to login</Link>
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-3 sm:gap-4">
                <div className="grid gap-1 sm:gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={cn(errors.password && "border-red-500")}
                      {...register("password", {
                        onChange: handleInputChange,
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>
                <div className="grid gap-1 sm:gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={cn(errors.confirmPassword && "border-red-500")}
                      {...register("confirmPassword", {
                        onChange: handleInputChange,
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading} className="mt-2">
                  {isLoading ? "Resetting password..." : "Reset password"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
