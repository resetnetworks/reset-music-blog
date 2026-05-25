import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import dbConnect from "@/lib/mongoose";
import Category from "@/models/Category";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reset Music",
  description: "Modern editorial-style SEO blog platform for music culture.",
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
