import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserCog, PartyPopper, Sparkles } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen gradient-subtle bg-red-600">
      {/* Beautiful Header */}
      <div className="gradient-primary shadow-elegant">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            RCCG YAYA Dinner {new Date().getFullYear()}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            An unforgettable evening of worship, fellowship, and elegant dining
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Admin Dashboard Card */}
          <Card className="shadow-elegant border-0 hover:shadow-hover transition-smooth group cursor-pointer">
            <CardHeader className="gradient-subtle text-center py-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce">
                <UserCog className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Admin Dashboard
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Manage submissions and approvals
              </p>
            </CardHeader>

            <CardContent className="p-8 text-center">
              <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
                <li>• View all registrations</li>
                <li>• Approve or reject submissions</li>
                <li>• Track payment receipts</li>
                <li>• Monitor event statistics</li>
              </ul>

              <Button className="w-full transition-bounce" size="lg" asChild>
                <Link to="/admin/login">
                  <UserCog className="w-4 h-4 mr-2" />
                  Access Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Registration Form Card */}
          <Card className="shadow-elegant border-0 hover:shadow-hover transition-smooth group cursor-pointer">
            <CardHeader className="gradient-success text-center py-8">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Event Registration
              </CardTitle>
              <p className="text-white/90 mt-2">
                Register for exclusive dinner event
              </p>
            </CardHeader>

            <CardContent className="p-8 text-center">
              <div className="bg-success/10 text-success px-4 py-2 rounded-full inline-flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-lg">₦12,000</span>
                <span className="text-sm">Registration Fee</span>
              </div>

              <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
                <li>• Elegant dinner & fellowship</li>
                <li>• Spirit-filled worship & ministration</li>
                <li>• Upload payment receipt for confirmation</li>
                <li>• ₦12,000 per person (all-inclusive)</li>
              </ul>

              <Button
                variant="success"
                className="w-full transition-bounce"
                size="lg"
                asChild
              >
                <Link to="/register">
                  <PartyPopper className="w-4 h-4 mr-2" />
                  Register Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
