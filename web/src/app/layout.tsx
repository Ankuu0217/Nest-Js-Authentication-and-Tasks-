import type { Metadata } from "next";
import { DM_Serif_Display, Nunito_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/Toast";
import { Providers } from "./providers";
import { env } from "@/env";
import "./globals.css";

const displayFont = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-loaded",
  display: "swap",
});

const sansFont = Nunito_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "MyTask",
    template: "%s · MyTask",
  },
  description:
    "A task API with a front end worth showing it in — NestJS auth and task management, built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
