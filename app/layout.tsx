import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "APEX LAB — everything you need to drop hot and win",
  description:
    "Apex Legends reference: legends, weapons, loadouts, drop spots, ranked tracker, movement tech, and live patch impact predictions.",
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink">
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10 pb-safe">
          {children}
        </main>
        <footer className="border-t border-line bg-surface/40 px-4 py-6 text-center text-xs text-muted md:px-6">
          APEX LAB · fan-made reference · not affiliated with EA or Respawn
        </footer>
      </body>
    </html>
  );
}
