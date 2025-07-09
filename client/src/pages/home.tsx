import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Features from "@/components/features";
import DemoVideo from "@/components/demo-video";
import IntegrationsPreview from "@/components/integrations-preview";
import TemplatesPreview from "@/components/templates-preview";
import DashboardPreview from "@/components/dashboard-preview";
import Pricing from "@/components/pricing";
import Security from "@/components/security";
import FAQ from "@/components/faq";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Features />
      <DemoVideo />
      <IntegrationsPreview />
      <TemplatesPreview />
      <DashboardPreview />
      <Pricing />
      <Security />
      <FAQ />
      <Footer />
    </div>
  );
}
