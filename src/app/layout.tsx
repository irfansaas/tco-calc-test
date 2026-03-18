import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import EnvironmentBanner from "@/components/ui/EnvironmentBanner";

export const metadata: Metadata = {
  title: "Citrix to AVD TCO Calculator | Nerdio",
  description: "Calculate your potential savings by migrating from Citrix to Azure Virtual Desktop with Nerdio. One number in, full business case out.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <EnvironmentBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
