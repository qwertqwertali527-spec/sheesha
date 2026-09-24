import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dubai Sheesha Delivery | Premium Sheesha at Your Door in 45 Mins",
  description: "Dubai's #1 premium sheesha home delivery. 30-60 min delivery across Dubai Marina, JLT, Downtown, Palm. Packages from AED 99. Licensed, hygienic, 5-star rated. Order via WhatsApp now!",
  keywords: "sheesha delivery dubai, shisha delivery dubai, hookah delivery dubai, dubai marina sheesha, jlt sheesha delivery",
  openGraph: {
    title: "Dubai Sheesha Delivery - Premium at Your Door",
    description: "Premium sheesha delivered in 45 mins anywhere in Dubai. From AED 99.",
    type: "website",
    locale: "en_AE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0a0a0a] text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
