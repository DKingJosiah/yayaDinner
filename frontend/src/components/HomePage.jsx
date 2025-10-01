import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  UserCog,
  PartyPopper,
  Sparkles,
  Crown,
  Star,
  CreditCard,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const HomePage = () => {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="min-h-screen gradient-elegant">
      {/* Elegant Header */}
      <div className="gradient-black-gold shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent"></div>
        <div className="absolute top-10 left-20 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-40 h-40 bg-gold/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center shadow-gold backdrop-blur-sm border border-gold/30">
              <Crown className="w-12 h-12 text-gold" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gold-light mb-6 tracking-tight">
            RCCG HOG Youth Dinner
          </h1>
          <p className="text-xl text-gold-light/80 max-w-2xl mx-auto leading-relaxed">
            An elegant evening of worship, fellowship, and divine celebration
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-gold fill-gold" />
            <Star className="w-5 h-5 text-gold fill-gold" />
            <Star className="w-5 h-5 text-gold fill-gold" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Admin Dashboard Card */}
          <Card className="shadow-elegant border-0 hover:shadow-gold transition-luxury group cursor-pointer bg-card/80 backdrop-blur-sm">
            <CardHeader className="gradient-elegant text-center py-10 border-b border-gold/10">
              <div className="mx-auto w-20 h-20 bg-black-matte rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-luxury shadow-md border border-gold/20">
                <UserCog className="w-10 h-10 text-gold" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Admin Dashboard
              </CardTitle>
              <p className="text-muted-foreground mt-3 text-lg">
                Manage submissions and approvals
              </p>
            </CardHeader>

            <CardContent className="p-10 text-center">
              <ul className="text-muted-foreground space-y-3 mb-8 text-left">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span>View all registrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span>Approve or reject submissions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span>Track payment receipts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span>Monitor event statistics</span>
                </li>
              </ul>

              <Button variant="elegant" className="w-full" size="xl" asChild>
                <Link to="/admin/login">
                  <UserCog className="w-5 h-5 mr-2" />
                  Access Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Registration Form Card */}
          <Card className="shadow-elegant border-0 hover:shadow-gold transition-luxury group cursor-pointer bg-card/80 backdrop-blur-sm">
            <CardHeader className="gradient-gold text-center py-10 border-b border-black/10">
              <div className="mx-auto w-20 h-20 bg-black/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-luxury shadow-md">
                <PartyPopper className="w-10 h-10 text-black" />
              </div>
              <CardTitle className="text-3xl font-bold text-black">
                Event Registration
              </CardTitle>
              <p className="text-black/80 mt-3 text-lg font-medium">
                Register for exclusive dinner event
              </p>
            </CardHeader>

            <CardContent className="p-10 text-center">
              <div className="bg-gold/10 text-gold border-2 border-gold/30 px-6 py-4 rounded-2xl inline-flex items-center gap-3 mb-8 shadow-md">
                <Sparkles className="w-6 h-6" />
                <div className="text-left">
                  <span className="font-bold text-2xl">₦12,000</span>
                  <div className="text-sm font-medium">Registration Fee</div>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="bg-black/10 border-2 border-gold/30 rounded-2xl p-6 mb-8 shadow-md">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <h3 className="text-lg font-bold text-gold">
                    Payment Details
                  </h3>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between p-3 bg-gold/5 rounded-lg border border-gold/20">
                    <div>
                      <span className="text-xs font-medium text-gold/70 block">
                        Account Name
                      </span>
                      <p className="text-sm font-semibold text-gold">
                        RCCG HOG YOUTH
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard("RCCG HOG YOUTH", "Account Name")
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
                      onClick={() => copyToClipboard("First Bank", "Bank Name")}
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

              <ul className="text-muted-foreground space-y-3 mb-8 text-left">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span>Elegant dinner & fellowship</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span>Spirit-filled worship & ministration</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span>Upload payment receipt for confirmation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span>₦12,000 per person (all-inclusive)</span>
                </li>
              </ul>

              <Button variant="gold" className="w-full" size="xl" asChild>
                <Link to="/register">
                  <PartyPopper className="w-5 h-5 mr-2" />
                  Register Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Event Information */}
        <div className="mt-16 text-center">
          <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 shadow-elegant border border-gold/10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-5 h-5 text-gold fill-gold" />
              <h3 className="text-2xl font-bold text-foreground">
                Event Highlights
              </h3>
              <Star className="w-5 h-5 text-gold fill-gold" />
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Join us for an evening of divine worship, exquisite dining, and
              meaningful fellowship. Experience the perfect blend of spiritual
              enrichment and elegant celebration.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                <span>Formal Attire</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                <span>Limited Seats</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                <span>All Ages Welcome</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
