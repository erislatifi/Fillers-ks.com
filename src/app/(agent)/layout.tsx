import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "../(frontend)/globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Fillers · Agjenti",
  robots: { index: false, follow: false },
  manifest: "/agjent.webmanifest",
  appleWebApp: { capable: true, title: "Fillers Agjenti", statusBarStyle: "default" },
  icons: { icon: "/brand/icon-32.png", apple: "/brand/icon-180.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Tablets: no accidental pinch-zoom while showing the catalogue; the app's own text is large.
  maximumScale: 1,
  userScalable: false,
  themeColor: "#14121a",
};

// Root layout of the agents' tablet app (/agjent) — no website header/footer.
export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="h-full bg-mist text-ink select-none">{children}</body>
    </html>
  );
}
