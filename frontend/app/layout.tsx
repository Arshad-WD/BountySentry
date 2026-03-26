import "./globals.css";
import AppShell from "@/app/components/AppShell";
import { Web3Provider } from "@/app/context/Web3Context";
import { ToastProvider } from "@/app/context/ToastContext";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import ErrorBoundary from "@/app/components/ErrorBoundary";

import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased selection:bg-[var(--selection)] selection:text-[var(--brand-text)]">
        <ErrorBoundary>
          <ToastProvider>
            <Web3Provider>
              <ThemeProvider>
                <div className="bg-mesh" />
                <AppShell>{children}</AppShell>
              </ThemeProvider>
            </Web3Provider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
