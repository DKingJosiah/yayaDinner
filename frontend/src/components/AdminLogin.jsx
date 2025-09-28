import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Shield } from "lucide-react";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, admin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  if (admin) {
    return <Navigate to="/admin/dashboard" />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-subtle py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-card">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Admin Portal
          </h2>
          <p className="mt-3 text-muted-foreground">
            Secure access to dinner registration management
          </p>
        </div>
        
        <Card className="shadow-card border-0 transition-smooth hover:shadow-hover">
          <CardHeader className="gradient-subtle border-b">
            <CardTitle className="text-center text-xl font-semibold">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      type="email"
                      className="pl-10 h-12 transition-smooth focus:shadow-card"
                      placeholder="Enter your admin email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      type="password"
                      className="pl-10 h-12 transition-smooth focus:shadow-card"
                      placeholder="Enter your password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold transition-bounce shadow-card hover:shadow-hover"
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
          <p className="text-xs text-muted-foreground">
            Secure admin access • Protected by authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;