import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Packages from "@/components/Packages";
import FlavorsAreas from "@/components/FlavorsAreas";
import HowItWorksFAQ from "@/components/HowItWorksFAQ";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import BookingCalendar from "@/components/BookingCalendar";
import PromotionsBanner from "@/components/PromotionsBanner";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <Hero />
      <PromotionsBanner />
      <Packages />
      <BookingCalendar />
      <FlavorsAreas />
      <HowItWorksFAQ />
      <Footer />
      <WhatsAppWidget />
    </main>
  );
}
