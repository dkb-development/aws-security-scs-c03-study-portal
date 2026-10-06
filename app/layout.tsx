import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWS Security Specialty Practice",
  description: "Interactive SCS-C03 practice questions organized by exam topic.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
