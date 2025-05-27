
import React, { useState } from 'react';
import { forgotPassword } from '@/services/passwordResetApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setStatus("loading");
    setError(null);
    
    try {
      await forgotPassword({ email: email.trim() });
      setStatus("sent");
      toast({
        title: "Reset Email Sent! 📧",
        description: "Please check your email for password reset instructions.",
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      setStatus("error");
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset instructions";
      setError(errorMessage);
      toast({
        title: "Failed to Send Reset Email",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  const handleResendEmail = async () => {
    setStatus("loading");
    setError(null);
    
    try {
      await forgotPassword({ email: email.trim() });
      toast({
        title: "Email Resent! 📧",
        description: "A new reset email has been sent to your inbox.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend email";
      setError(errorMessage);
      toast({
        title: "Failed to Resend Email",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setStatus("sent");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              {status === "sent" 
                ? "Check your email for reset instructions"
                : "Enter your email to receive reset instructions"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {status === "sent" ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Email Sent Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    We've sent password reset instructions to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Don't see the email? Check your spam folder.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button onClick={handleResendEmail} variant="outline" className="w-full">
                    Resend Email
                  </Button>
                  <Button onClick={handleBackToLogin} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === "loading"}
                    className="w-full"
                  />
                </div>
                
                {status === "error" && error && (
                  <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Sending..." : "Send Reset Instructions"}
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  onClick={handleBackToLogin}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
