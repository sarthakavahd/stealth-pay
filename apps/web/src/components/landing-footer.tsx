import Link from 'next/link';
import { ArrowUpRight, Github, Shield, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#flow', label: 'Flow' },
  { href: '#insights', label: 'Blog' },
  { href: '/login', label: 'Sign in' },
] as const;

const productLinks = [
  { href: '/dashboard', label: 'Dashboard demo' },
  { href: '/scan', label: 'Scanner view' },
  { href: '/receive', label: 'Receive flow' },
  { href: '/send', label: 'Send flow' },
] as const;

const trustStats = [
  { value: '1 → 1', label: 'tx to address mapping' },
  { value: '30s', label: 'scanner detection cycle' },
  { value: '0', label: 'static address reuse' },
] as const;

export function LandingFooter(): React.JSX.Element {
  return (
    <footer id="contact" className="relative mt-20 border-t border-white/10 bg-black/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/55 to-transparent" />

      <div className="mx-auto max-w-6xl px-6 pb-8 pt-12 md:px-8 md:pt-14">
        <div className="mb-8 rounded-[1.8rem] border border-white/10 bg-gradient-to-r from-fuchsia-500/12 via-white/[0.04] to-cyan-400/10 p-5 backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge variant="accent" className="w-fit gap-2 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Production-grade privacy
              </Badge>
              <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
                Build private Bitcoin payment UX your users can trust.
              </h3>
            </div>

            <Link
              href="/signup"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-rose-300 to-amber-200 px-5 py-2.5 text-sm font-medium text-black transition hover:scale-[1.02]"
            >
              Start free
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr,0.8fr,0.8fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-fuchsia-100/85">
              <Shield className="h-3.5 w-3.5" />
              Stealth Pay
            </div>
            <p className="max-w-md text-sm leading-7 text-white/58">
              Privacy-first payment infrastructure on top of proven wallet rails — designed for
              product clarity, operational confidence, and enterprise trust.
            </p>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {trustStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3"
                >
                  <div className="text-sm font-light text-white">{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/40">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/35">Navigate</div>
            <div className="space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-white/70 transition hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/35">Product</div>
            <div className="space-y-2.5 text-sm">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-white/70 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/35">Connect</div>
            <div className="space-y-2.5 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-fuchsia-300" /> Next.js + shadcn
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-300" /> Supabase + RLS
              </div>
              <Link
                href="https://github.com/YogeshK34/Stealth-Address-Payment-System"
                className="inline-flex items-center gap-2 transition hover:text-fuchsia-200"
              >
                <Github className="h-4 w-4" /> GitHub repository
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-7" />

        <div className="flex flex-col gap-2 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <div>© 2026 Stealth Pay</div>
          <div>Hyper-modern stealth payment UX · Privacy by architecture</div>
        </div>
      </div>
    </footer>
  );
}
