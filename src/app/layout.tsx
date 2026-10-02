import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aménagements raisonnables",
  description: "Catalogue d'aménagements et d'outils par trouble, pour les institutrices et les parents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning : des extensions (ex. Daspalecte, ColorZilla) ajoutent des attributs à <html> et <body>.
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
