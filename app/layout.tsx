import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./museum.css";
import { ExperienceProvider } from "@/engine/experience-controller";
import { MuseumNav } from "@/components/MuseumNav";

export const metadata: Metadata = {
  title: { default: "VESTIGE — A Museum of Human Experience", template: "%s · VESTIGE" },
  description: "Everything leaves something behind. An immersive digital museum of human experience.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#111111", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <ExperienceProvider>
          <MuseumNav />
          <main id="main">{children}</main>
        </ExperienceProvider>
      </body>
    </html>
  );
}
