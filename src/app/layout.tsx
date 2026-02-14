import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kraken OS",
  description: "Enterprise Agent Harness Platform",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" className="dark">
    <body
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased grain`}
    >
      <Sidebar />
      <main className="ml-[240px] min-h-screen">
        <div className="max-w-[1400px] mx-auto px-8 py-8">{children}</div>
      </main>
    </body>
  </html>
);

export default RootLayout;
