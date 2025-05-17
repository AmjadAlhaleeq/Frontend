// src/pages/Privacy.tsx
import { Shield, EyeOff, Lock, Server } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <Shield className="w-10 h-10 mx-auto text-purple-600" />
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          We value your privacy and protect your data.
        </p>
      </div>

      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <EyeOff className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Data Collection</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We only collect data necessary for registration and booking
              services.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Lock className="w-6 h-6 text-green-500 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Security</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your personal data is encrypted and stored securely.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Server className="w-6 h-6 text-orange-500 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Data Sharing</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We do not sell or share your data with third parties without
              consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
