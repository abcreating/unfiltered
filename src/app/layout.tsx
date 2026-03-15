import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Unfiltered — What leaders actually said.",
  description:
    "A non-partisan archive of full-text transcripts of speeches by world leaders. No editorial spin. No summaries. No algorithms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, instrumentSerif.variable, "font-sans")}
    >
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
