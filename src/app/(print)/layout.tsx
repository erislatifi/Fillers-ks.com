import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Bare root layout for printable documents (no site header/footer, no admin chrome).
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body style={{ margin: 0, background: "#f4f4f5" }}>{children}</body>
    </html>
  );
}
