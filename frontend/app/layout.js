import { Raleway, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const raleway = Raleway({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Detector manipulare — Parlamentul Republicii Moldova",
  description:
    "Analiza fragmentelor din stenograme: indice de manipulare, tehnici detectate și explicații.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ro"
      className={`${raleway.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
