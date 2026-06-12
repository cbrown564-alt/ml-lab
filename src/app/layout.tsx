import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SmallScreenNotice } from "@/components/shell/SmallScreenNotice";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ML Lab",
  description:
    "An immersive, visual machine learning laboratory — interactive exhibits connected in a knowledge graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmallScreenNotice />
        {children}
      </body>
    </html>
  );
}
