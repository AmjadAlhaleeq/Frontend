// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';
// import { ArrowLeft, Mail, KeyRound, Shield } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { forgotPassword, verifyOtp, resetPassword } from '@/services/authApi';

// type Step = 'email' | 'otp' | 'reset' | 'success';

// const ForgotPasswordDemo: React.FC = () => {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState<Step>('email');
//   const [isLoading, setIsLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     email: '',
//     otp: '',
//     newPassword: '',
//     confirmPassword: ''
//   });

//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.email) {
//       toast({
//         title: "Email Required",
//         description: "Please enter your email address.",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await forgotPassword({ email: formData.email });

//       if (response.status === 'success') {
//         toast({
//           title: "OTP Sent",
//           description: "Please check your email for the verification code.",
//         });
//         setCurrentStep('otp');
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to send OTP. Please try again.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.otp) {
//       toast({
//         title: "OTP Required",
//         description: "Please enter the verification code.",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await verifyOtp({
//         email: formData.email,
//         otp: formData.otp
//       });

//       if (response.status === 'success') {
//         toast({
//           title: "OTP Verified",
//           description: "Please enter your new password.",
//         });
//         setCurrentStep('reset');
//       }
//     } catch (error) {
//       toast({
//         title: "Invalid OTP",
//         description: error instanceof Error ? error.message : "Please check the code and try again.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePasswordReset = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.newPassword || !formData.confirmPassword) {
//       toast({
//         title: "Password Required",
//         description: "Please fill in both password fields.",
//         variant: "destructive"
//       });
//       return;
//     }

//     if (formData.newPassword !== formData.confirmPassword) {
//       toast({
//         title: "Password Mismatch",
//         description: "Passwords do not match.",
//         variant: "destructive"
//       });
//       return;
//     }

//     if (formData.newPassword.length < 6) {
//       toast({
//         title: "Weak Password",
//         description: "Password must be at least 6 characters long.",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await resetPassword({
//         email: formData.email,
//         newPassword: formData.newPassword,
//         confirmPassword: formData.confirmPassword
//       });

//       if (response.status === 'success') {
//         toast({
//           title: "Password Reset Successful",
//           description: "Your password has been updated successfully.",
//         });
//         setCurrentStep('success');
//       }
//     } catch (error) {
//       toast({
//         title: "Reset Failed",
//         description: error instanceof Error ? error.message : "Failed to reset password. Please try again.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleInputChange = (field: keyof typeof formData, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleBackToLogin = () => {
//     navigate('/');
//   };

//   const handleResendOtp = async () => {
//     setIsLoading(true);
//     try {
//       await forgotPassword({ email: formData.email });
//       toast({
//         title: "OTP Resent",
//         description: "A new verification code has been sent to your email.",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to resend OTP. Please try again.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 'email':
//         return (
//           <form onSubmit={handleEmailSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email" className="flex items-center">
//                 <Mail className="mr-2 h-4 w-4 text-gray-500" />
//                 Email Address
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email address"
//                 value={formData.email}
//                 onChange={(e) => handleInputChange('email', e.target.value)}
//                 required
//                 disabled={isLoading}
//                 className="w-full"
//               />
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? 'Sending...' : 'Send Reset Code'}
//             </Button>
//           </form>
//         );

//       case 'otp':
//         return (
//           <form onSubmit={handleOtpSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="otp" className="flex items-center">
//                 <Shield className="mr-2 h-4 w-4 text-gray-500" />
//                 Verification Code
//               </Label>
//               <Input
//                 id="otp"
//                 type="text"
//                 placeholder="Enter 6-digit code"
//                 value={formData.otp}
//                 onChange={(e) => handleInputChange('otp', e.target.value)}
//                 required
//                 disabled={isLoading}
//                 maxLength={6}
//                 className="w-full text-center tracking-widest"
//               />
//             </div>
//             <div className="text-center">
//               <p className="text-sm text-gray-600 mb-2">
//                 Didn't receive the code?
//               </p>
//               <Button
//                 type="button"
//                 variant="link"
//                 onClick={handleResendOtp}
//                 disabled={isLoading}
//                 className="text-blue-600 hover:text-blue-800"
//               >
//                 Resend Code
//               </Button>
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? 'Verifying...' : 'Verify Code'}
//             </Button>
//           </form>
//         );

//       case 'reset':
//         return (
//           <form onSubmit={handlePasswordReset} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="newPassword" className="flex items-center">
//                 <KeyRound className="mr-2 h-4 w-4 text-gray-500" />
//                 New Password
//               </Label>
//               <Input
//                 id="newPassword"
//                 type="password"
//                 placeholder="Enter new password"
//                 value={formData.newPassword}
//                 onChange={(e) => handleInputChange('newPassword', e.target.value)}
//                 required
//                 disabled={isLoading}
//                 minLength={6}
//                 className="w-full"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword" className="flex items-center">
//                 <KeyRound className="mr-2 h-4 w-4 text-gray-500" />
//                 Confirm Password
//               </Label>
//               <Input
//                 id="confirmPassword"
//                 type="password"
//                 placeholder="Confirm new password"
//                 value={formData.confirmPassword}
//                 onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
//                 required
//                 disabled={isLoading}
//                 minLength={6}
//                 className="w-full"
//               />
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? 'Updating...' : 'Update Password'}
//             </Button>
//           </form>
//         );

//       case 'success':
//         return (
//           <div className="text-center space-y-4">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//               <Shield className="h-8 w-8 text-green-600" />
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold text-green-800">Password Reset Complete!</h3>
//               <p className="text-gray-600 mt-2">
//                 Your password has been successfully updated. You can now login with your new password.
//               </p>
//             </div>
//             <Button onClick={handleBackToLogin} className="w-full">
//               Back to Login
//             </Button>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const getStepTitle = () => {
//     switch (currentStep) {
//       case 'email':
//         return 'Reset Your Password';
//       case 'otp':
//         return 'Enter Verification Code';
//       case 'reset':
//         return 'Create New Password';
//       case 'success':
//         return 'Success!';
//       default:
//         return 'Reset Password';
//     }
//   };

//   const getStepDescription = () => {
//     switch (currentStep) {
//       case 'email':
//         return 'Enter your email address and we\'ll send you a verification code to reset your password.';
//       case 'otp':
//         return `We've sent a 6-digit verification code to ${formData.email}`;
//       case 'reset':
//         return 'Please enter your new password. Make sure it\'s at least 6 characters long.';
//       case 'success':
//         return '';
//       default:
//         return '';
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
//       <div className="max-w-md w-full">
//         <Card className="shadow-lg">
//           <CardHeader className="text-center">
//             <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
//             {getStepDescription() && (
//               <CardDescription className="text-gray-600">
//                 {getStepDescription()}
//               </CardDescription>
//             )}
//           </CardHeader>
//           <CardContent>
//             {renderStepContent()}

//             {currentStep !== 'success' && (
//               <div className="mt-6 text-center">
//                 <Button
//                   variant="link"
//                   onClick={handleBackToLogin}
//                   className="text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
//                 >
//                   <ArrowLeft className="mr-2 h-4 w-4" />
//                   Back to Login
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ForgotPasswordDemo;
