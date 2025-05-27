
import React, { useState } from 'react';
import { forgotPassword, verifyOtp, resetPassword } from '@/services/passwordResetApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Step = 'email' | 'otp' | 'password' | 'success';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    setError(null);
    
    try {
      await forgotPassword({ email: email.trim() });
      setStep('otp');
      toast({
        title: "OTP Sent! 📧",
        description: "Please check your email for the 6-digit verification code.",
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMessage);
      toast({
        title: "Failed to Send OTP",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Incomplete Code",
        description: "Please enter the complete 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await verifyOtp({ email: email.trim(), otp });
      setStep('password');
      toast({
        title: "Code Verified! ✅",
        description: "Now create your new password.",
      });
    } catch (err) {
      console.error('Error verifying OTP:', err);
      const errorMessage = err instanceof Error ? err.message : "Invalid verification code";
      setError(errorMessage);
      toast({
        title: "Invalid Verification Code",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter and confirm your new password.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword({ 
        email: email.trim(), 
        newPassword: newPassword.trim(), 
        confirmPassword: confirmPassword.trim() 
      });
      setStep('success');
      toast({
        title: "Password Reset Successful! 🎉",
        description: "Your password has been updated successfully.",
      });
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
      setError(errorMessage);
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await forgotPassword({ email: email.trim() });
      toast({
        title: "Code Resent! 📧",
        description: "A new verification code has been sent to your email.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend code";
      setError(errorMessage);
      toast({
        title: "Failed to Resend Code",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'email':
        return <Mail className="h-8 w-8 text-blue-600" />;
      case 'otp':
        return <Shield className="h-8 w-8 text-green-600" />;
      case 'password':
        return <Lock className="h-8 w-8 text-purple-600" />;
      case 'success':
        return <CheckCircle2 className="h-8 w-8 text-green-600" />;
      default:
        return <Mail className="h-8 w-8 text-blue-600" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Password';
      case 'otp':
        return 'Verify Email';
      case 'password':
        return 'Reset Password';
      case 'success':
        return 'Success';
      default:
        return 'Forgot Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Enter your email to receive reset instructions';
      case 'otp':
        return 'Enter the 6-digit code sent to your email';
      case 'password':
        return 'Create your new password';
      case 'success':
        return 'Your password has been reset successfully';
      default:
        return 'Enter your email to receive reset instructions';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                {getStepIcon()}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Email Entry */}
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
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
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                
                {error && (
                  <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
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

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <div className="space-y-6">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  📧 Check your email: <strong className="text-gray-900">{email}</strong>
                  <br />
                  <span className="text-xs text-gray-500 mt-1 block">Don't see it? Check your spam folder</span>
                </div>
                
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
                  </div>
                )}

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Resend Code
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('email')} disabled={isLoading}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6} className="flex-1">
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Password Reset */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <strong>Password requirements:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Contains letters and numbers</li>
                      <li>• Strong and unique</li>
                    </ul>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('otp')} disabled={isLoading}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Updating...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Password Reset Complete! 🎉
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Your password has been successfully updated. You can now login with your new password.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Remember to keep your password safe and don't share it with anyone.
                  </p>
                </div>
                
                <Button onClick={handleBackToLogin} className="w-full">
                  Continue to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
