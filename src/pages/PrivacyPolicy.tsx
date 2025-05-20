
import React from 'react';

/**
 * Privacy Policy Page Component
 * Displays the application's privacy policy with detailed sections
 */
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Privacy Policy</h1>
      
      <div className="prose max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            At BOKIT, we respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when 
            you visit our website and tell you about your privacy rights and how the law protects you.
          </p>
          <p>
            This policy applies to all users of our platform, including players, pitch owners, 
            and administrators. Please read this privacy policy carefully to understand our 
            practices regarding your personal data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped as follows:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Identity Data</strong>: includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong>: includes email address, phone number, and city of residence.</li>
            <li><strong>Profile Data</strong>: includes your username, password, preferences, feedback, and survey responses.</li>
            <li><strong>Usage Data</strong>: includes information about how you use our website and services.</li>
            <li><strong>Marketing and Communications Data</strong>: includes your preferences in receiving marketing from us.</li>
          </ul>
          <p>
            We do not collect any Special Categories of Personal Data about you (this includes details about your race or ethnicity, 
            religious or philosophical beliefs, sex life, sexual orientation, political opinions, trade union membership, information 
            about your health, and genetic and biometric data).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To register you as a new customer.</li>
            <li>To process and manage your bookings.</li>
            <li>To manage our relationship with you.</li>
            <li>To enable you to participate in community features of our service.</li>
            <li>To administer and protect our business and this website.</li>
            <li>To deliver relevant website content and advertisements to you.</li>
            <li>To use data analytics to improve our website, services, marketing, customer relationships, and experiences.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
          <p className="mb-4">
            We use cookies to distinguish you from other users of our website, to provide you with a good experience when you browse our website, 
            and to improve our site. A cookie is a small file of letters and numbers that we store on your browser or the hard drive of your computer.
          </p>
          <p>
            You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. 
            If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed 
            in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, 
            contractors and other third parties who have a business need to know.
          </p>
          <p>
            We have put in place procedures to deal with any suspected personal data breach and will notify you and any applicable 
            regulator of a breach where we are legally required to do so.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p>
            We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
            including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Legal Rights</h2>
          <p className="mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request access to your personal data.</li>
            <li>Request correction of your personal data.</li>
            <li>Request erasure of your personal data.</li>
            <li>Object to processing of your personal data.</li>
            <li>Request restriction of processing your personal data.</li>
            <li>Request transfer of your personal data.</li>
            <li>Right to withdraw consent.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at: 
            <a href="mailto:bookitandkickit@gmail.com" className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 ml-1">
              bookitandkickit@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our privacy policy from time to time. We will notify you of any changes by posting the new 
            privacy policy on this page and updating the "last updated" date at the top of this privacy policy.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: May 20, 2025</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
