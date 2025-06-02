import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Logo from "../shared/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * Footer component with company information, links, and contact details
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleEmailClick = () => {
    // Open Gmail compose window with company email
    const companyEmail = "bookitandkickit@gmail.com";
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${companyEmail}&su=Contact%20from%20BOKIT%20Website`;
    window.open(gmailUrl, "_blank");
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center md:justify-items-start">
          {/* Logo and About Section */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Logo height={145} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 max-w-sm">
              BOKIT is the premier platform for football pitch reservations,
              connecting players with the best pitches in your area.
            </p>
            <div className="flex space-x-4 pt-2 justify-center md:justify-start">
              <SocialLink
                href="https://www.facebook.com/"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </SocialLink>
              <SocialLink href="https://x.com/" aria-label="Twitter">
                <Twitter size={20} />
              </SocialLink>
              <SocialLink
                href="https://www.instagram.com/"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </SocialLink>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col space-y-2">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/rules">Rules</FooterLink>
              <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-center md:justify-start">
                <Mail className="h-5 w-5 text-[#0F766E] dark:text-[#34d399] mt-1 me-3 flex-shrink-0" />
                <button
                  onClick={handleEmailClick}
                  className="text-gray-600 dark:text-gray-400 hover:text-[#0F766E] dark:hover:text-[#34d399] transition-colors text-left"
                >
                  bookitandkickit@gmail.com
                  <span className="block text-xs text-gray-500 mt-1">
                    Click to send us an email
                  </span>
                </button>
              </div>
              <div className="flex items-start justify-center md:justify-start">
                <Phone className="h-5 w-5 text-[#0F766E] dark:text-[#34d399] mt-1 me-3 flex-shrink-0" />
                <a
                  href="tel:+962795016133"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#0F766E] dark:hover:text-[#34d399] transition-colors"
                >
                  00962795016133
                </a>
              </div>
              <div className="flex items-start justify-center md:justify-start">
                <MapPin className="h-5 w-5 text-[#0F766E] dark:text-[#34d399] mt-1 me-3 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">
                  Amman, Jordan
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            © {currentYear} BOKIT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

/**
 * Social media link component
 */
const SocialLink = ({
  href,
  children,
  ...props
}: React.ComponentProps<"a">) => (
  <a
    href={href}
    className="text-gray-500 hover:text-[#0F766E] dark:text-gray-400 dark:hover:text-[#34d399] transition-colors duration-300"
    target="_blank"
    rel="noopener noreferrer"
    {...props}
  >
    {children}
  </a>
);

/**
 * Footer navigation link component
 */
const FooterLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <Link
    to={to}
    className="text-gray-600 dark:text-gray-400 hover:text-[#0F766E] dark:hover:text-[#34d399] transition-colors duration-300"
  >
    {children}
  </Link>
);

export default Footer;
