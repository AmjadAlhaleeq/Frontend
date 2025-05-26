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
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo and about section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Logo height={145} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              {t("footer.about")}
            </p>
            <div className="flex space-x-4 pt-2">
              <SocialLink href="#" aria-label="Facebook">
                <Facebook size={20} />
              </SocialLink>
              <SocialLink href="#" aria-label="Twitter">
                <Twitter size={20} />
              </SocialLink>
              <SocialLink href="#" aria-label="Instagram">
                <Instagram size={20} />
              </SocialLink>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t("footer.quickLinks")}
            </h3>
            <div className="flex flex-col space-y-2">
              <FooterLink to="/">{t("nav.home")}</FooterLink>
              <FooterLink to="/pitches">{t("nav.pitches")}</FooterLink>
              <FooterLink to="/reservations">
                {t("nav.reservations")}
              </FooterLink>
              <FooterLink to="/leaderboards">
                {t("nav.leaderboards")}
              </FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/rules">Rules</FooterLink>
              <Link
                to="/privacy-policy"
                className="text-gray-600 hover:text-teal-500 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t("footer.contactUs")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-[#0F766E] dark:text-[#34d399] mt-1 me-3" />
                <span className="text-gray-600 dark:text-gray-400">
                  bookitandkickit@gmail.com
                </span>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-[#0F766E] dark:text-[#34d399] mt-1 me-3" />
                <span className="text-gray-600 dark:text-gray-400">
                  00962795016133
                </span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-[#0F766E] dark:text-[#34d399] mt-1 me-3" />
                <span className="text-gray-600 dark:text-gray-400">
                  Amman, Jordan
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            © {currentYear} BOKIT. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

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
