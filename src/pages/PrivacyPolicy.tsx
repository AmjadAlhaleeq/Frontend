
// src/pages/Privacy.tsx
import { Shield, EyeOff, Lock, Server, AlertCircle, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>Privacy Policy | BOKIT</title>
      </Helmet>
      
      <div className="text-center mb-10">
        <Shield className="w-10 h-10 mx-auto text-[#0F766E]" />
        <h1 className="text-3xl font-bold mt-4">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          We value your privacy and protect your data
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Our Commitment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          At BOKIT, we're committed to protecting your personal information and being transparent about how we use it. This Privacy Policy explains how we collect, use, and safeguard your data when you use our pitch booking platform.
        </p>
      </div>

      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="bg-[#0F766E]/10 p-2 rounded-full">
            <EyeOff className="w-6 h-6 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Data Collection</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              We only collect data necessary for registration and booking services. This includes your name, email, and gameplay statistics for leaderboards. Your payment information is processed securely by our payment partners and is not stored on our servers.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <div className="bg-[#0F766E]/10 p-2 rounded-full">
            <Lock className="w-6 h-6 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Security</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Your personal data is encrypted and stored securely. We employ industry-standard security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <div className="bg-[#0F766E]/10 p-2 rounded-full">
            <Server className="w-6 h-6 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Data Sharing</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              We do not sell or share your data with third parties without consent. Your gameplay statistics may be visible to other users on leaderboards, but personal contact information remains private.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <div className="bg-[#0F766E]/10 p-2 rounded-full">
            <UserCheck className="w-6 h-6 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Your Rights</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              You have the right to access, modify, or delete your personal information. You can manage your profile and privacy settings within your account dashboard or contact our support team for assistance.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <div className="bg-[#0F766E]/10 p-2 rounded-full">
            <AlertCircle className="w-6 h-6 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Policy Updates</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              We may update this Privacy Policy periodically. We will notify you of any significant changes via email or through our platform. The latest version will always be available on our website.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
        <p>Last updated: May 17, 2025</p>
        <p className="mt-2">If you have any questions about our Privacy Policy, please contact us at privacy@bokit.com</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
