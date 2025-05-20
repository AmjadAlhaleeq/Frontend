
import React from "react";
import { Shield, EyeOff, Lock, Server, AlertCircle, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet";

/**
 * Privacy Policy Page
 * Displays the app's privacy policy with information about data collection and usage
 */
const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>Privacy Policy | BOKIT</title>
      </Helmet>
      
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30">
          <Shield className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-3xl font-bold mt-4 text-gray-800 dark:text-gray-100">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-lg mx-auto">
          We value your privacy and are committed to protecting your personal data
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Our Commitment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          At BOKIT, we're committed to protecting your personal information and being transparent about how we use it. 
          This Privacy Policy explains how we collect, use, and safeguard your data when you use our pitch booking platform.
        </p>
      </div>

      <div className="space-y-8">
        <PrivacySection 
          icon={<EyeOff className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
          title="Data Collection"
          content="We only collect data necessary for registration and booking services. This includes your name, email, and gameplay statistics for leaderboards. Your payment information is processed securely by our payment partners and is not stored on our servers."
        />

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <PrivacySection 
          icon={<Lock className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
          title="Security"
          content="Your personal data is encrypted and stored securely. We employ industry-standard security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information."
        />

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <PrivacySection 
          icon={<Server className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
          title="Data Sharing"
          content="We do not sell or share your data with third parties without consent. Your gameplay statistics may be visible to other users on leaderboards, but personal contact information remains private."
        />

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <PrivacySection 
          icon={<UserCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
          title="Your Rights"
          content="You have the right to access, modify, or delete your personal information. You can manage your profile and privacy settings within your account dashboard or contact our support team for assistance."
        />

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <PrivacySection 
          icon={<AlertCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
          title="Policy Updates"
          content="We may update this Privacy Policy periodically. We will notify you of any significant changes via email or through our platform. The latest version will always be available on our website."
        />
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: May 20, 2025</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          If you have any questions about our Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@bokit.com" className="text-teal-600 dark:text-teal-400 hover:underline">
            privacy@bokit.com
          </a>
        </p>
      </div>
    </div>
  );
};

/**
 * Privacy Section Component
 * Reusable section component for privacy policy content
 */
interface PrivacySectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const PrivacySection: React.FC<PrivacySectionProps> = ({ icon, title, content }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
