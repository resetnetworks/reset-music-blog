import Link from "next/link";
import { 
  ArrowLeft, 
  Headphones, 
  Mic, 
  Users, 
  Sparkles, 
  Heart, 
  Share2, 
  Mail, 
  Building, 
  Send,
  PenTool,
  Globe
} from "lucide-react";

export const metadata = {
  title: "About Us | Reset Music",
  description: "Learn more about Reset Music, our mission, values, and legal presence.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Back to Home */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      {/* Hero Header */}
      <div className="max-w-3xl mb-16">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6 leading-[1.15]">
          About Reset Music
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          We believe in the transformative power of music. Our mission is to connect listeners, creators, and innovators through a platform where music resets, renews, and redefines what it means to feel inspired.
        </p>
      </div>

      {/* Our Mission */}
      <div className="border-t border-border/40 pt-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Our Mission
            </h2>
          </div>
          <div className="md:col-span-2">
            <p className="text-lg text-foreground/90 leading-relaxed">
              We exist to help artists reach new ears—and for listeners to discover sounds that refresh their day and stir their soul. Reset Music is where music resets your perspective, renews your energy, and redefines your connection to sound.
            </p>
          </div>
        </div>
      </div>

      {/* What We Do - Four Pillars */}
      <div className="border-t border-border/40 pt-12 mb-20">
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            What We Do
          </h2>
          <p className="text-sm text-muted-foreground">Four pillars that define the Reset Music experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-secondary/30 rounded-xl border border-border/40 hover:border-border/80 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-foreground/5 rounded-lg">
                <Headphones className="w-5 h-5 text-foreground/80" />
              </div>
              <h3 className="font-semibold text-base">Listening Experience</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We offer an ever-growing library of tracks, albums, and curated playlists across genres—whether you're into indie, electronic, rock, hip-hop, or ambient explorations, Reset Music has something for every mood.
            </p>
          </div>

          <div className="p-6 bg-secondary/30 rounded-xl border border-border/40 hover:border-border/80 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-foreground/5 rounded-lg">
                <Mic className="w-5 h-5 text-foreground/80" />
              </div>
              <h3 className="font-semibold text-base">Artist Showcase</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We're committed to promoting emerging and established artists alike. From features to interviews, live sessions to exclusive drops, Reset Music gives artists the spotlight to share their stories and creativity with our community.
            </p>
          </div>

          <div className="p-6 bg-secondary/30 rounded-xl border border-border/40 hover:border-border/80 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-foreground/5 rounded-lg">
                <Users className="w-5 h-5 text-foreground/80" />
              </div>
              <h3 className="font-semibold text-base">Community & Connection</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Beyond just streaming, we build connection. Users can engage with artists, participate in music challenges, discover upcoming gigs, and join a network of fellow music lovers.
            </p>
          </div>

          <div className="p-6 bg-secondary/30 rounded-xl border border-border/40 hover:border-border/80 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-foreground/5 rounded-lg">
                <Sparkles className="w-5 h-5 text-foreground/80" />
              </div>
              <h3 className="font-semibold text-base">Innovation & Quality</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We invest in audio quality, user-friendly designs, and continuous innovation—making sure every touchpoint of using Reset Music feels intuitive, vibrant, and reliable.
            </p>
          </div>
        </div>
      </div>

      {/* Why We Started */}
      <div className="border-t border-border/40 pt-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Why We Started
            </h2>
          </div>
          <div className="md:col-span-2 space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              We saw a gap: music platforms often either cater only to big names or overwhelm users with volume without context. Reset Music was born to bridge that divide.
            </p>
            <p>
              We wanted a place where new voices matter, where discovering music is an experience, not a task—and where every listener finds something that truly resets them.
            </p>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="border-t border-border/40 pt-12 mb-20">
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Our Values
          </h2>
          <p className="text-sm text-muted-foreground">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-secondary/20 rounded-xl border border-border/40">
            <div className="p-1.5 bg-foreground/5 rounded-md w-fit mb-3">
              <Headphones className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm mb-2">Music First</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every decision we make starts with how it serves the music and the artists who create it.
            </p>
          </div>

          <div className="p-6 bg-secondary/20 rounded-xl border border-border/40">
            <div className="p-1.5 bg-foreground/5 rounded-md w-fit mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm mb-2">Community Driven</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We believe the best discoveries happen when passionate music lovers share what moves them.
            </p>
          </div>

          <div className="p-6 bg-secondary/20 rounded-xl border border-border/40">
            <div className="p-1.5 bg-foreground/5 rounded-md w-fit mb-3">
              <Mic className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm mb-2">Artist Focused</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              From emerging talents to established names, we provide a platform where every artist's voice matters.
            </p>
          </div>
        </div>
      </div>

      {/* Ways to Connect & General Info */}
      <div className="border-t border-border/40 pt-12 mb-20">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">
          Join Our Community
        </h2>
        <p className="text-base text-muted-foreground mb-10 max-w-3xl leading-relaxed">
          Whether you're here to discover, to create, or to simply play and pause with the soundtrack of your life—Reset Music is your space.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-secondary/30 rounded-xl border border-border/40 flex items-start gap-4">
            <Share2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Follow Social</h3>
              <p className="text-xs text-muted-foreground">Updates, releases, behind-the-scenes content</p>
            </div>
          </div>

          <div className="p-6 bg-secondary/30 rounded-xl border border-border/40 flex items-start gap-4">
            <Send className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Newsletter</h3>
              <p className="text-xs text-muted-foreground">Exclusive tracks, artist stories, early access</p>
            </div>
          </div>

          <div className="p-6 bg-secondary/30 rounded-xl border border-border/40 flex items-start gap-4">
            <PenTool className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Contribute</h3>
              <p className="text-xs text-muted-foreground">Artists, creators, curators—reach out and share your vision</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 md:p-12 bg-secondary/40 rounded-2xl border border-border/45 text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-2xl font-semibold mb-3">Ready to reset your music experience?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Get in touch with us for support, partnerships, or general inquiries.
        </p>
        <a
          href="mailto:support@musicreset.com"
          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
        >
          support@musicreset.com
        </a>
      </div>

      {/* Registered Offices */}
      <div className="border-t border-border/40 pt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8 text-center">
          Registered Offices
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* India Office */}
          <div className="p-6 bg-secondary/20 rounded-xl border border-border/40 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <Building className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-sm">RESET NETWORKS (OPC) PRIVATE LIMITED</h3>
            </div>
            
            <div className="text-xs space-y-2 text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">CIN:</span>
                <p className="font-mono mt-0.5 text-foreground/80">U92100WB2021OPC243771</p>
              </div>
              
              <div>
                <span className="font-semibold text-foreground">GSTIN:</span>
                <p className="font-mono mt-0.5 text-foreground/80">07AAKCR8658Q1Z8</p>
              </div>
              
              <div>
                <span className="font-semibold text-foreground">Address:</span>
                <p className="mt-0.5 leading-relaxed">
                  45 Maharishi Dayanand Road, Corner Market, Malviya Nagar,<br />
                  New Delhi, Delhi, 110017, India
                </p>
              </div>
            </div>
          </div>

          {/* Estonia Office */}
          <div className="p-6 bg-secondary/20 rounded-xl border border-border/40 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-sm">RESET NETWORKS OÜ</h3>
            </div>
            
            <div className="text-xs space-y-2 text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Registry Code:</span>
                <p className="font-mono mt-0.5 text-foreground/80">17321913</p>
              </div>
              
              <div>
                <span className="font-semibold text-foreground">Address:</span>
                <p className="mt-0.5 leading-relaxed">
                  Harju maakond, Tallinn, Kesklinna linnaosa,<br />
                  Sakala tn 7-2, 10141, Estonia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
