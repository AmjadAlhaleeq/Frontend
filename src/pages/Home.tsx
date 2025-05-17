// This is the Home.tsx page. It handles UI and logic for Home.

import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Star, Users, Shield, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      {/* Hero Section with new football pitch background */}
      <section className="relative min-h-[600px] flex items-center justify-center bg-[url('/images/bgHomePage.PNG')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            {t("home.hero.title")}{" "}
            <span className="text-bokit-400">Instantly</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-bokit-500 hover:bg-bokit-600"
            >
              <Link to="/pitches">{t("home.cta.findPitches")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link to="/reservations">{t("home.cta.viewReservations")}</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.services.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-[#0F766E]" />}
              title={t("home.feature.booking.title")}
              description={t("home.feature.booking.desc")}
            />
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-[#0F766E]" />}
              title={t("home.feature.nearby.title")}
              description={t("home.feature.nearby.desc")}
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-[#0F766E]" />}
              title={t("home.feature.games.title")}
              description={t("home.feature.games.desc")}
            />
            <FeatureCard
              icon={<Star className="h-10 w-10 text-[#0F766E]" />}
              title={t("home.feature.rate.title")}
              description={t("home.feature.rate.desc")}
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-[#0F766E]" />}
              title={t("home.feature.payments.title")}
              description={t("home.feature.payments.desc")}
            />
            <FeatureCard
              icon={<Trophy className="h-10 w-10 text-[#0F766E]" />}
              title={t("home.feature.leaderboards.title")}
              description={t("home.feature.leaderboards.desc")}
            />
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.howItWorks.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number={1}
              title={t("home.step.find.title")}
              description={t("home.step.find.desc")}
            />
            <StepCard
              number={2}
              title={t("home.step.book.title")}
              description={t("home.step.book.desc")}
            />
            <StepCard
              number={3}
              title={t("home.step.play.title")}
              description={t("home.step.play.desc")}
            />
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-[#0F766E] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{t("home.ready.title")}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t("home.ready.desc")}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#0F766E] hover:bg-gray-100"
          >
            <Link to="/pitches">{t("home.ready.cta")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const StepCard = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-[#0F766E] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default Home;
