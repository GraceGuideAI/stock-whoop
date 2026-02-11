import "./globals.css";
import type { Metadata } from "next";
import { Bungee, Karla } from "next/font/google";

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display"
});

const karla = Karla({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Stock-WHOOP",
  description: "A playful stock-style dashboard for your WHOOP metrics."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bungee.variable} ${karla.variable}`}>
      <body className="bg-hero-splash min-h-screen text-ink">
        {children}
      </body>
    </html>
  );
}
