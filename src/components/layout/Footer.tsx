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
              <Link href="/category/production" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Production
              </Link>
              <Link href="/category/industry" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Industry
              </Link>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Topics
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/tag/mixing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Mixing
              </Link>
              <Link href="/tag/sound-design" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sound Design
              </Link>
              <Link href="/tag/career" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Career
              </Link>
              <Link href="/tag/workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Workflow
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
