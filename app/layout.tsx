import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CareProof — TechHavenLabs",
    template: "%s | CareProof",
  },
  description:
    "CareProof — Blockchain Record Integrity and Access Portal by TechHavenLabs. " +
    "Register, verify, and manage healthcare record hashes on a local blockchain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={inter.className}
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay so content stays readable across all pages */}
        <div className="min-h-screen flex flex-col bg-white/70 backdrop-blur-[2px]">
          <Providers>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </Providers>
        </div>
      </body>
    </html>
  );
}
