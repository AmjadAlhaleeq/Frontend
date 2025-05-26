
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ForgotPasswordDialog from './ForgotPasswordDialog';
import { Mail, Lock, CheckCircle, Shield, Key, Star, Zap } from "lucide-react";

const ForgotPasswordDemo: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);

  const features = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Validation",
      description: "Smart email format validation before sending OTP"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "6-Digit OTP",
      description: "Secure verification with user-friendly input interface"
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Password Security",
      description: "Strong password requirements and confirmation matching"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Success Feedback",
      description: "Clear confirmation and guidance for next steps"
    },
    {
      icon: <Key className="h-5 w-5" />,
      title: "API Integration",
      description: "Fully connected to backend endpoints"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-time Validation",
      description: "Instant feedback and error handling"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Enter Email",
      description: "User enters their email address to receive verification code"
    },
    {
      step: 2,
      title: "Verify OTP",
      description: "6-digit code sent to email must be entered correctly"
    },
    {
      step: 3,
      title: "New Password",
      description: "Create and confirm a new secure password"
    },
    {
      step: 4,
      title: "Success",
      description: "Password updated successfully, ready to login"
    }
  ];

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Forgot Password System
            <Star className="inline-block ml-2 h-8 w-8 text-yellow-500" />
          </h1>
          <p className="text-xl text-gray-600">
            Complete password recovery solution with modern UX
          </p>
          <Badge variant="default" className="text-lg px-4 py-2">
            ✨ Production Ready
          </Badge>
        </div>

        {/* Demo Button */}
        <div className="text-center">
          <Button 
            onClick={() => setShowDialog(true)}
            size="lg"
            className="text-lg px-8 py-6 h-auto"
          >
            <Lock className="mr-2 h-5 w-5" />
            Try Forgot Password Demo
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Password Recovery Process</CardTitle>
            <CardDescription className="text-center">
              Simple 4-step process for secure password reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Frontend Features</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• React TypeScript components</li>
                  <li>• Shadcn/ui design system</li>
                  <li>• Real-time form validation</li>
                  <li>• Toast notifications</li>
                  <li>• Loading states & animations</li>
                  <li>• Responsive design</li>
                  <li>• Accessibility compliant</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend Integration</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• POST /forget-password (send OTP)</li>
                  <li>• POST /verify-otp (validate code)</li>
                  <li>• POST /reset-password (update)</li>
                  <li>• Proper error handling</li>
                  <li>• Security validation</li>
                  <li>• Rate limiting support</li>
                  <li>• Email service integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-gray-600 italic">
            "This is a complete, production-ready forgot password implementation with modern UX patterns!"
          </p>
        </div>
      </div>

      <ForgotPasswordDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
};

export default ForgotPasswordDemo;
