import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../services/api"; // Use the configured api instance
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  User,
  Phone,
  Mail,
  UserCheck,
  Upload,
  DollarSign,
  Sparkles,
  Clock,
} from "lucide-react";

const RegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("email", data.email);
      formData.append("referredBy", data.referredBy);
      formData.append("receipt", data.receipt[0]);

      const response = await api.post("/api/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setReferenceId(response.data.referenceId);
      setIsSuccess(true);
      toast.success("Registration submitted successfully!");
      reset();
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error types
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
        
        // Show additional details if available
        if (error.response.data.details) {
          setTimeout(() => {
            toast.error(error.response.data.details, { duration: 6000 });
          }, 1000);
        }
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to submit registration. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-success/10 rounded-full flex items-center justify-center mb-6 shadow-card">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-4xl font-bold text-foreground tracking-tight">
              Registration Complete!
            </h2>
            <p className="mt-3 text-muted-foreground">
              Your dinner registration has been successfully submitted
            </p>
          </div>

          <Card className="shadow-card border-0">
            <CardHeader className="gradient-subtle border-b text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Reference ID
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-6">
              <div className="bg-muted/30 p-6 rounded-xl border-2 border-dashed border-primary/20">
                <code className="text-2xl font-mono text-primary font-bold tracking-wider">
                  {referenceId}
                </code>
              </div>
              <Badge
                variant="secondary"
                className="bg-warning/10 text-warning border-warning/20"
              >
                <Clock className="w-3 h-3 mr-1" />
                Pending Review
              </Badge>

              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setReferenceId("");
                }}
                className="w-full h-12"
              >
                <User className="w-4 h-4 mr-2" />
                Register Another Person
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-subtle py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-card">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Exclusive Dinner Event
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join us for an unforgettable evening of fellowship
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 p-4 bg-success/5 rounded-xl border border-success/20">
            <div className="text-left">
              <span className="text-4xl font-bold text-success">₦12,000</span>
              <p className="text-sm text-success/80 font-medium">Registration Fee</p>
            </div>
          </div>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="gradient-subtle border-b">
            <CardTitle className="text-center text-xl font-semibold">
              Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* First & Last Name side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName", { required: "First name is required" })}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName", { required: "Last name is required" })}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  {...register("phoneNumber", { required: "Phone number is required" })}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Referred By */}
              <div className="space-y-2">
                <Label htmlFor="referredBy">Who Referred You?</Label>
                <Input
                  id="referredBy"
                  {...register("referredBy", { required: "Referrer is required" })}
                  placeholder="Enter referrer's name"
                />
                {errors.referredBy && (
                  <p className="text-sm text-destructive">{errors.referredBy.message}</p>
                )}
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label htmlFor="receipt">Upload Payment Receipt</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  {...register("receipt", {
                    required: "Receipt is required",
                  })}
                />
                {errors.receipt && (
                  <p className="text-sm text-destructive">{errors.receipt.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 font-semibold transition-bounce bg-purple-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Registration...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Secure registration • Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
