import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "UNIGARDEN Kiracı Paneli",
  description: "Kiracı bilgi ve yönetim portalı",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={geist.variable}>
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
