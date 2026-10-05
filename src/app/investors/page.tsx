import type { Metadata } from "next";
import InvestorRelationsClient from "./InvestorRelationsClient";

export const metadata: Metadata = {
  title: "Investor Relations | Reset Music",
  description: "Financial performance, standalone audited financial statements, key revenue metrics, balance sheet, and corporate governance for RESET NETWORKS.",
  openGraph: {
    title: "Investor Relations | RESET NETWORKS - Reset Music",
    description: "Financial performance, standalone audited financial statements, key revenue metrics, balance sheet, and corporate governance for RESET NETWORKS.",
    url: "https://blog.musicreset.com/investors",
    siteName: "Reset Music",
    type: "website",
    images: [
      {
        url: "https://musicreset.com/og-image-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Reset Music Investor Relations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Investor Relations | RESET NETWORKS - Reset Music",
    description: "Financial performance, standalone audited financial statements, key revenue metrics, balance sheet, and corporate governance for RESET NETWORKS.",
    images: ["https://musicreset.com/og-image-1200x630.jpg"],
  },
};

export default function InvestorsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "RESET NETWORKS (OPC) PRIVATE LIMITED Investor Financials",
    "provider": {
      "@type": "Organization",
      "name": "RESET NETWORKS (OPC) PRIVATE LIMITED",
      "legalName": "RESET NETWORKS (OPC) PRIVATE LIMITED",
      "url": "https://blog.musicreset.com",
      "identifier": "U92100WB2021OPC243771",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "45 Maharishi Dayanand Road, Corner Market, Malviya Nagar",
        "addressLocality": "New Delhi",
        "addressRegion": "Delhi",
        "postalCode": "110017",
        "addressCountry": "IN"
      }
    },
    "description": "RESET NETWORKS works across independent music, digital music services, artist-facing activity, studio and venue experiences, events, and audio research."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InvestorRelationsClient />
    </>
  );
}
