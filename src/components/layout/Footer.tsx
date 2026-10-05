import Link from "next/link";
import { Music } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 mt-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span className="font-semibold text-sm">Reset Music</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A modern editorial platform for music culture, production techniques, and artist education.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explore
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Articles
              </Link>
              <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                News
              </Link>
              <Link href="/category/music-production" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Music Production
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </Link>
              <Link href="/investors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Investor Relations
              </Link>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Topics
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/tag/ambient" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Ambient
              </Link>
              <Link href="/tag/electronic" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Electronic
              </Link>
              <Link href="/tag/experimental" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Experimental
              </Link>
              <Link href="/tag/soundscapes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Soundscapes
              </Link>
              <Link href="/tag/techno" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Techno
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Reset Music. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Built for music creators</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
