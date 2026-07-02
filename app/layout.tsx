import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lines of Code - Local Repository Analytics",
  description: "Scan your local repository recursively and client-side to see file structure, total lines of code, blank lines, comments, and language composition instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <TooltipProvider delayDuration={150}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
