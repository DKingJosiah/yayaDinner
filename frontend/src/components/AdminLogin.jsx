import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from '../contexts/authContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Shield, Crown, Star, KeyRound } from "lucide-react";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, admin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (admin) {
    return <Navigate to="/admin/dashboard" />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-elegant">
      {/* Elegant Header Section */}
      <div className="gradient-black-gold shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center shadow-gold backdrop-blur-sm border border-gold/30">
              <Shield className="w-10 h-10 text-gold" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gold-light mb-4 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-lg text-gold-light/80 max-w-xl mx-auto">
            Secure access to dinner registration management system
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="text-gold font-semibold text-sm">Authorized Personnel Only</span>
            <Star className="w-4 h-4 text-gold fill-gold" />
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-black-matte rounded-2xl flex items-center justify-center mb-6 shadow-elegant border border-gold/20">
              <KeyRound className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-3 text-muted-foreground">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <Card className="shadow-elegant border-0 hover:shadow-gold transition-luxury bg-card/80 backdrop-blur-sm">
            <CardHeader className="gradient-black-gold text-center py-8 border-b border-gold/10">
              <div className="mx-auto w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Crown className="w-6 h-6 text-gold" />
              </div>
              <CardTitle className="text-xl font-semibold text-gold-light">
                Administrator Access
              </CardTitle>
              <p className="text-gold-light/70 text-sm mt-2">
                Secure authentication required
              </p>
            </CardHeader>
            
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-gold" />
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                            message: "Please enter a valid email address",
                          },
                        })}
                        type="email"
                        className="pl-10 h-12 transition-luxury focus:shadow-gold border-gold/20 focus:border-gold/50"
                        placeholder="Enter your admin email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <span className="w-2 h-2 bg-destructive rounded-full"></span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-gold" />
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        type="password"
                        className="pl-10 h-12 transition-luxury focus:shadow-gold border-gold/20 focus:border-gold/50"
                        placeholder="Enter your password"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <span className="w-2 h-2 bg-destructive rounded-full"></span>
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="elegant"
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-gold/10">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Shield className="w-3 h-3 text-gold" />
                Secure admin access • Protected by authentication
                <Shield className="w-3 h-3 text-gold" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
