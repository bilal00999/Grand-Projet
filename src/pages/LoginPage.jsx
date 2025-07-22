import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChefHat, ArrowLeft, Mail, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { signInWithMagicLink, demoLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (countdown > 0) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithMagicLink(email);
      if (result.success) {
        setEmailSent(true);
      } else {
        if (result.message?.toLowerCase().includes("too many requests")) {
          setError(
            "Please wait 30 seconds before requesting another magic link."
          );
          setCountdown(30);
        } else {
          setError(
            result.message || "Failed to send magic link. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error sending magic link:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const user = demoLogin(email || "demo@example.com");
    if (user) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0">
        <header className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <ChefHat className="h-8 w-8 text-emerald-600" />
                <span className="text-xl font-bold text-gray-900">
                  AI Recipe Generator
                </span>
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Mail className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {emailSent ? "Check your email" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {emailSent
              ? `We've sent a secure login link to ${email}`
              : "Enter your email to receive a magic login link"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error}
                {countdown > 0 && ` (${countdown}s)`}
              </AlertDescription>
            </Alert>
          )}

          {!emailSent ? (
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    disabled={isLoading || countdown > 0}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading || !email || countdown > 0}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending magic link...</span>
                    </div>
                  ) : countdown > 0 ? (
                    `Try again in ${countdown}s`
                  ) : (
                    "Send Magic Link"
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  We'll send you a secure login link. No password required!
                </p>
              </form>

              {/* Demo Login Button */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or for demo
                  </span>
                </div>
              </div>

              <Button
                onClick={handleDemoLogin}
                variant="outline"
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Zap className="h-4 w-4 mr-2" />
                Quick Demo Login
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Skip the email step and try the app immediately
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  Click the link in your email to sign in. The link will expire
                  in 15 minutes.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Use different email
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                onClick={handleDemoLogin}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Continue with Demo Login
              </Button>

              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or use demo
                login to continue.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
