import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Market City — Explore the market",
  description:
    "Explore the market as a living city. Discover companies, sectors, and the stories behind market moves.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
