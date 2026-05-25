import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import dbConnect from "@/lib/mongoose";
import Category from "@/models/Category";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.musicreset.com"),
  title: {
    default: "Reset Music",
    template: "%s | Reset Music",
  },
  description: "A modern editorial platform for music culture, production techniques, and artist education.",
  keywords: ["music production", "music industry", "sound design", "mixing", "mastering", "beat making", "recording techniques", "music culture"],
  openGraph: {
    title: "Reset Music",
    description: "A modern editorial platform for music culture, production techniques, and artist education.",
    url: "https://blog.musicreset.com",
    siteName: "Reset Music",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Reset Music",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reset Music",
    description: "A modern editorial platform for music culture, production techniques, and artist education.",
    images: ["/og-default.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let serializedCategories: any[] = [];
  try {
    await dbConnect();
    const categories = await Category.find().limit(4).lean();
    
    // Serialize ObjectId to string for Client Component
    serializedCategories = categories.map((cat: any) => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
    }));
  } catch (error) {
    console.error("Failed to fetch categories in layout:", error);
  }

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <Navigation categories={serializedCategories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
