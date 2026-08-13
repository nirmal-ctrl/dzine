import type { Metadata } from "next";
import { Open_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { TooltipProvider } from "@/components/ui/tooltip";

const openSans = Open_Sans({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Somae — Your Brand. Understood by AI.",
  description:
    "Somae is the AI-powered Brand Operating System. It reads your brand, creates content that connects, and helps you grow across every platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
