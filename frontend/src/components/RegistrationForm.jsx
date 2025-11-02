import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../services/api";
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
  Sparkles,
  Clock,
  Star,
  Copy,
  CreditCard,
} from "lucide-react";
import rccgImage from "../assets/rccg.png";
import yayaImage from "../assets/yaya.jpeg";

// Phone number formatting utility
const formatPhoneNumber = (value) => {
  if (!value) return "";
  
  // Remove all non-digit characters
  let cleaned = value.replace(/\D/g, "");
  
  // Remove country code if present (234 for Nigeria)
  if (cleaned.startsWith("234")) {
    cleaned = "0" + cleaned.substring(3);
  }
  // Ensure it starts with 0
  else if (!cleaned.startsWith("0")) {
    cleaned = "0" + cleaned;
  }
  
  // Limit to 11 digits (Nigerian format)
  cleaned = cleaned.substring(0, 11);
  
  return cleaned;
};

const RegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    // watch,
  } = useForm();

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue("phoneNumber", formatted);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("email", data.email);
      formData.append("referredBy", data.referredBy || ""); // Optional field
      formData.append("receipt", data.receipt[0]);

      const response = await api.post("/api/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setReferenceId(response.data.referenceId);
      setIsSuccess(true);
      toast.success("Registration submitted successfully!");
      reset();
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.data?.error) {
        toast.error(error.response.data.error);

        if (error.response.data.details) {
          setTimeout(() => {
            toast.error(error.response.data.details, { duration: 6000 });
          }, 1000);
        }
      } else if (error.code === "NETWORK_ERROR") {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("Failed to submit registration. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen gradient-elegant">
        {/* Success Header */}
        <div className="gradient-black-gold shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent"></div>
          <div className="absolute top-5 left-10 w-20 h-20 bg-gold/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-5 right-10 w-24 h-24 bg-gold/5 rounded-full blur-2xl"></div>

          <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center shadow-gold backdrop-blur-sm border border-gold/30">
                <CheckCircle className="w-10 h-10 text-gold" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gold-light mb-4 tracking-tight">
              Registration Complete!
            </h1>
            <p className="text-lg text-gold-light/80 max-w-xl mx-auto">
              Your dinner registration has been successfully submitted
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full space-y-8">
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="gradient-gold text-center py-8 border-b border-black/10">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-black">
                  <Sparkles className="w-6 h-6" />
                  Your Reference ID
                </CardTitle>
                <p className="text-black/80 font-medium mt-2">
                  Keep this for your records
                </p>
              </CardHeader>
              <CardContent className="p-8 text-center space-y-6">
                <div className="bg-gold/10 py-8  rounded-2xl border-2 border-gold/30 shadow-gold">
                  <code className="text-xl font-mono text-gold font-bold tracking-wider block">
                    {referenceId}
                  </code>
                </div>

                <Badge
                  variant="gradient"
                  className="px-6 py-2 text-base font-semibold"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pending Review
                </Badge>

                <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-gold/10">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    What's Next?
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                      <span>Admin will review your submission</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                      <span>You'll receive confirmation via email</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                      <span>Use reference ID to check status</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    setIsSuccess(false);
                    setReferenceId("");
                  }}
                  variant="elegant"
                  className="w-full h-12 font-semibold"
                >
                  <User className="w-4 h-4 mr-2" />
                  Register Another Person
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-elegant">
      {/* Registration Header */}
      <div className="gradient-black-gold shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent"></div>
        <div className="absolute top-5 left-10 w-20 h-20 bg-gold/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-5 right-10 w-24 h-24 bg-gold/5 rounded-full blur-2xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          {/* Images Section */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gold/30 shadow-gold">
              <img
                src={rccgImage}
                alt="RCCG Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gold/30 shadow-gold">
              <img
                src={yayaImage}
                alt="Event Image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gold-light mb-4 tracking-tight">
            DINNING WITH THE KING 2.0
          </h1>
          <p className="text-lg text-gold-light max-w-xl mx-auto">
            Join us for an unforgettable evening of fellowship and celebration
          </p>

          <div className="mt-8 bg-gold/10 text-gold border-2 border-gold/30 px-8 py-6 rounded-2xl inline-flex items-center gap-4 shadow-gold backdrop-blur-sm">
            <Sparkles className="w-8 h-8" />
            <div className="text-left">
              <span className="font-bold text-4xl">₦12,000</span>
              <div className="text-lg font-semibold">Registration Fee</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-elegant border-0 hover:shadow-gold transition-luxury bg-card/80 backdrop-blur-sm">
            <CardHeader className="gradient-gold text-center py-8 border-b border-black/10">
              <CardTitle className="text-2xl font-bold text-black flex items-center justify-center gap-2">
                <User className="w-6 h-6" />
                Registration Details
              </CardTitle>
              <p className="text-black/80 font-medium mt-2">
                Complete your registration below
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* First & Last Name side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-semibold text-foreground flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-gold" />
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        {...register("firstName", {
                          required: "First name is required",
                        })}
                        placeholder="Enter first name"
                        className="pl-10 h-12 transition-luxury focus:shadow-gold border-gold/20 focus:border-gold/50"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <div className="w-1 h-1 bg-destructive rounded-full"></div>
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-semibold text-foreground flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-gold" />
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        {...register("lastName", {
                          required: "Last name is required",
                        })}
                        placeholder="Enter last name"
                        className="pl-10 h-12 transition-luxury focus:shadow-gold border-gold/20 focus:border-gold/50"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <div className="w-1 h-1 bg-destructive rounded-full"></div>
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-sm font-semibold text-foreground flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-gold" />
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      {...register("phoneNumber", {
                        required: "Phone number is required",
                        validate: (value) => {
                          const formatted = formatPhoneNumber(value);
                          return formatted.length === 11 || "Phone number must be 11 digits";
                        }
                      })}
                      onChange={handlePhoneChange}
                      placeholder="e.g. 08012345678"
                      className="pl-10 h-12 transition-luxury focus:shadow-gold border-gold/20 focus:border-gold/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter in format: 08012345678
                  </p>
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <div className="w-1 h-1 bg-destructive rounded-full"></div>
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-foreground flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-gold" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { required: "Email is required" })}
                      placeholder="Enter your email"
                      className="pl-10 h-12 transition-luxury focus:shadow-gold border-gold/20 focus:border-gold/50"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <div className="w-1 h-1 bg-destructive rounded-full"></div>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Referred By - OPTIONAL */}
                <div className="space-y-2">
                  <Label
                    htmlFor="referredBy"
                    className="text-sm font-semibold text-foreground flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-gold" />
                    Who Referred You? <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="referredBy"
                      {...register("referredBy")}
                      placeholder="Enter referrer's name (optional)"
                      className="pl-10 h-12 transition-luxury focus:shadow-gold border-gold/20 focus:border-gold/50"
                    />
                  </div>
                </div>

                {/* Payment Details Section */}
                <div className="bg-black/10 border-2 border-gold/30 rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-gold" />
                    <h3 className="text-lg font-bold text-gold">
                      Payment Details
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gold/5 rounded-lg border border-gold/20">
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">
                          Account Name
                        </span>
                        <p className="text-sm font-semibold text-gold">
                          RCCG HOG YOUTH FELLOWSHIP
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard("RCCG HOG YOUTH FELLOWSHIP", "Account Name")
                        }
                        className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                      >
                        {copiedField === "Account Name" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gold/60 hover:text-gold" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gold/5 rounded-lg border border-gold/20">
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">
                          Account Number
                        </span>
                        <p className="text-sm font-semibold text-gold font-mono">
                          2043686126
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard("2043686126", "Account Number")
                        }
                        className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                      >
                        {copiedField === "Account Number" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gold/60 hover:text-gold" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gold/5 rounded-lg border border-gold/20">
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">
                          Bank Name
                        </span>
                        <p className="text-sm font-semibold text-gold">
                          First Bank
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard("First Bank", "Bank Name")
                        }
                        className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                      >
                        {copiedField === "Bank Name" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gold/60 hover:text-gold" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <Label
                    htmlFor="receipt"
                    className="text-sm font-semibold text-foreground flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-gold" />
                    Upload Payment Receipt
                  </Label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <Input
                      id="receipt"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      {...register("receipt", {
                        required: "Receipt is required",
                      })}
                      className="pl-10 h-12 transition-luxury focus:shadow-gold border-gold/20 focus:border-gold/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 cursor-pointer relative z-20"
                    />
                  </div>
                  {errors.receipt && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <div className="w-1 h-1 bg-destructive rounded-full"></div>
                      {errors.receipt.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="gold"
                  className="w-full h-14 text-lg font-semibold"
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
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 shadow-elegant border border-gold/10">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                Secure registration • Your data is protected
                <div className="w-2 h-2 bg-gold rounded-full"></div>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;