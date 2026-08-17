import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bitcoin,
  Blocks,
  Eye,
  Fingerprint,
  LockKeyhole,
  Orbit,
  Radar,
  ScanLine,
  Shield,
  Sparkles,
  Wallet,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { LandingFaq } from '@/components/landing-faq';
import { LandingFooter } from '@/components/landing-footer';
import { LandingInsights } from '@/components/landing-insights';
import { LandingMotion } from '@/components/landing-motion';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingPricing } from '@/components/landing-pricing';
import { LandingShowcase } from '@/components/landing-showcase';
import { LandingTestimonials } from '@/components/landing-testimonials';

const featureCards = [
  {
    icon: Fingerprint,
    title: 'Zero address reuse',
    description:
      'Every payment resolves to a unique on-chain destination. Observers see nothing linkable — ever.',
  },
  {
    icon: Shield,
    title: 'Institutional infrastructure',
    description:
      'Wallet execution runs on enterprise-grade custody rails, so the privacy layer never compromises security.',
  },
  {
    icon: Eye,
    title: 'Private inbound detection',
    description:
      'Receivers scan for incoming funds using isolated view keys — no exposure of spend authority required.',
  },
  {
    icon: Radar,
    title: 'Always-on scanning',
    description:
      'Continuous transaction monitoring detects ownership in near real-time, without revealing receiver identity.',
  },
  {
    icon: LockKeyhole,
    title: 'ECDH privacy layer',
    description:
      'Cryptographic key derivation severs the link between sender and receiver at the protocol level.',
  },
  {
    icon: Wallet,
    title: 'Built to ship fast',
    description:
      'Clean typed APIs, enforced auth boundaries, and composable services let your team move without friction.',
  },
] as const;

const steps = [
  {
    id: '01',
    title: 'Publish a stealth address',
    text: 'The receiver shares a reusable public key pair — view and spend — without ever reusing a static Bitcoin address.',
    accent: 'from-cyan-400/20 to-cyan-400/5',
    border: 'border-cyan-400/15',
    dot: 'bg-cyan-400',
  },
  {
    id: '02',
    title: 'Sender derives a one-time output',
    text: 'An ephemeral key is generated per payment. A unique on-chain destination is computed — invisible to outside observers.',
    accent: 'from-violet-400/20 to-violet-400/5',
    border: 'border-violet-400/15',
    dot: 'bg-violet-400',
  },
  {
    id: '03',
    title: 'Scanner detects, receiver controls',
    text: 'The scanner inspects outputs with the view key only. The receiver retains exclusive spend authority.',
    accent: 'from-emerald-400/20 to-emerald-400/5',
    border: 'border-emerald-400/15',
    dot: 'bg-emerald-400',
  },
] as const;

const stats = [
  { value: '1 tx', label: 'One address per payment' },
  { value: '30s', label: 'Scan-to-detect latency' },
  { value: '0', label: 'Shared address reuse events' },
  { value: '100%', label: 'Non-custodial receiver control' },
];

export default function HomePage(): React.JSX.Element {
  return (
    <main className="relative overflow-hidden text-white">
      <LandingNavbar />

      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-grid absolute inset-0 opacity-30" />
        <div className="animate-float-slow absolute left-[6%] top-24 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="animate-float-delay absolute right-[8%] top-20 h-[420px] w-[420px] rounded-full bg-violet-600/12 blur-[150px]" />
        <div className="animate-pulse-soft absolute bottom-0 left-1/2 h-80 w-96 -translate-x-1/2 rounded-full bg-fuchsia-500/8 blur-[130px]" />
      </div>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative px-6 pb-28 pt-36 md:px-8 md:pb-36 md:pt-48" data-reveal>
        <div className="mx-auto max-w-6xl">
          {/* Eyebrow */}
          <div className="mb-8 flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-light uppercase tracking-[0.3em] text-cyan-200/70 backdrop-blur-xl">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              Stealth-address Bitcoin payments
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/35 tracking-wide">Scanner active</span>
            </div>
          </div>

          {/* Headline — more air, bolder split */}
          <div className="max-w-5xl space-y-6">
            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-light leading-[1.0] tracking-[-0.055em] text-white">
              Crypto Payments That Leave <br className="hidden lg:block" />
              <span className="text-gradient-premium">No Trail Behind Them.</span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-white/55 md:text-xl">
              Stealth Pay generates a fresh on-chain address for every inbound payment. Senders
              send. Receivers control. Observers see nothing.
            </p>
          </div>

          {/* CTAs — clear, compelling, not dev-speak */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-rose-300 to-amber-200 px-7 py-4 text-sm font-medium text-black shadow-[0_24px_64px_rgba(251,191,36,0.22)] transition hover:scale-[1.02] hover:shadow-[0_24px_80px_rgba(251,191,36,0.32)]"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-7 py-4 text-sm font-light text-white/80 backdrop-blur-xl transition hover:border-white/22 hover:bg-white/8 hover:text-white"
            >
              Watch live demo
              <ChevronRight className="h-4 w-4 opacity-60" />
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            {[
              'No address reuse — ever',
              'Non-custodial by default',
              'Enterprise custody rails',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-xs text-white/55 backdrop-blur-sm"
              >
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE DEMO CARD — full-width spotlight ────────── */}
      <section className="relative px-6 pb-24 md:px-8" data-reveal>
        <div className="mx-auto max-w-6xl">
          <div
            className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-10"
            data-glow
          >
            {/* Top shimmer */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

            <div className="grid gap-8 lg:grid-cols-[1fr,1fr,1fr]">
              {/* Header */}
              <div className="lg:col-span-3 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Live payment surface
                  </div>
                  <div className="mt-1.5 text-2xl font-light text-white">Privacy orchestration</div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-4 py-1.5 text-xs font-light text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Scanner active
                </div>
              </div>

              {/* Derivation flow */}
              <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-slate-950/50 p-6">
                <div className="mb-5 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-white/30">
                  <span>Derived payment route</span>
                  <span>ECDH key agreement</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-xl border border-cyan-400/12 bg-cyan-400/6 px-5 py-4">
                    <Orbit className="h-5 w-5 text-cyan-300 shrink-0" />
                    <div>
                      <div className="text-xs text-white/40">Receiver stealth address</div>
                      <div className="mt-0.5 font-mono text-sm text-cyan-100">
                        A + B public keys
                      </div>
                    </div>
                    <div className="ml-auto rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] text-cyan-300">
                      Published once
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="text-[10px] uppercase tracking-widest text-white/25">
                      ephemeral derivation
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-violet-400/12 bg-violet-400/6 px-5 py-4">
                    <Bitcoin className="h-5 w-5 text-violet-300 shrink-0" />
                    <div>
                      <div className="text-xs text-white/40">One-time address</div>
                      <div className="mt-0.5 font-mono text-sm text-violet-100">
                        P = H(r·A)·G + B
                      </div>
                    </div>
                    <div className="ml-auto rounded-full bg-violet-400/10 px-2.5 py-1 text-[10px] text-violet-300">
                      Unique per tx
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats column */}
              <div className="flex flex-col gap-3">
                <div className="flex-1 rounded-2xl border border-white/8 bg-white/4 p-5" data-glow>
                  <div className="flex items-center gap-2 text-xs font-light text-white/55">
                    <ScanLine className="h-3.5 w-3.5 text-cyan-300" />
                    Detection latency
                  </div>
                  <div className="mt-4 text-4xl font-light tracking-tight text-white">30s</div>
                  <p className="mt-2 text-xs leading-5 text-white/38">
                    Near real-time scan cadence across all monitored outputs.
                  </p>
                </div>
                <div className="flex-1 rounded-2xl border border-white/8 bg-white/4 p-5" data-glow>
                  <div className="flex items-center gap-2 text-xs font-light text-white/55">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
                    Privacy guarantee
                  </div>
                  <div className="mt-4 text-4xl font-light tracking-tight text-white">1 → 1</div>
                  <p className="mt-2 text-xs leading-5 text-white/38">
                    One transaction. One address. Zero reuse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ────────────────────────────────────── */}
      <section className="relative px-6 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel rounded-2xl px-6 py-6 text-center"
                data-glow
              >
                <div className="text-3xl font-light tracking-tight text-white">{stat.value}</div>
                <div className="mt-2 text-xs text-white/40 leading-5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="relative px-6 py-24 md:px-8" data-reveal>
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl space-y-5">
            <div className="text-xs font-light uppercase tracking-[0.3em] text-cyan-200/60">
              What powers it
            </div>
            <h2 className="text-4xl font-light leading-[1.1] tracking-tight text-white md:text-5xl">
              Cryptographic privacy with a product experience that doesn't feel like a research
              paper.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-reveal>
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="glass-panel group rounded-[1.75rem] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/9"
                  data-glow
                >
                  <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/15 to-violet-400/15 text-cyan-200 ring-1 ring-white/8 transition group-hover:scale-105 group-hover:from-cyan-400/25 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-light text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/50">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section id="flow" className="relative px-6 py-24 md:px-8" data-reveal>
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-xl space-y-5">
            <div className="text-xs font-light uppercase tracking-[0.3em] text-violet-200/60">
              How it works
            </div>
            <h2 className="text-4xl font-light leading-[1.1] tracking-tight text-white md:text-5xl">
              Simple for senders. Private for receivers. Invisible to everyone else.
            </h2>
          </div>

          <div className="space-y-4" data-reveal>
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`glass-panel relative overflow-hidden rounded-[1.75rem] p-7 md:p-8 border ${step.border}`}
                data-glow
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${step.accent}`} />
                <div className="flex items-start gap-6 md:gap-8">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-light text-white/60">
                    {step.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-white">{step.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">{step.text}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-white/15 hidden md:block" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE PROOF ───────────────────────────── */}
      <section id="proof" className="relative px-6 py-24 md:px-8" data-reveal>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="glass-panel rounded-[2rem] p-8 md:p-10" data-glow>
              <div className="mb-7 flex items-center gap-3 text-xs font-light uppercase tracking-[0.28em] text-cyan-200/60">
                <Blocks className="h-4 w-4" />
                Architecture rationale
              </div>
              <h2 className="max-w-xl text-3xl font-light leading-[1.15] tracking-tight text-white md:text-4xl">
                Privacy lives above the wallet layer — not inside it.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/50">
                Stealth Pay doesn't replace your wallet stack. It wraps around it — adding
                cryptographic unlinkability as a clean protocol layer while keeping custody, key
                management, and execution exactly where they belong.
              </p>
              <Link
                href="/docs/architecture"
                className="mt-7 inline-flex items-center gap-2 text-sm text-cyan-300/80 transition hover:text-cyan-200"
              >
                Read the architecture doc
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="glass-panel rounded-[2rem] p-8" data-glow>
              <div className="mb-7 text-xs font-light uppercase tracking-[0.28em] text-emerald-200/60">
                System properties
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Address sharing model', value: 'View + spend key pair' },
                  { label: 'Auth boundary', value: 'Session-backed, isolated' },
                  { label: 'Custody layer', value: 'Enterprise rails' },
                  { label: 'Detection method', value: 'Ephemeral metadata scan' },
                  { label: 'Receiver control', value: 'Non-custodial spend keys' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/4 px-4 py-3.5"
                  >
                    <div className="text-xs text-white/40">{item.label}</div>
                    <div className="text-right text-xs font-light text-white/75">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────── */}
      <section className="relative px-6 py-24 md:px-8" data-reveal>
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-panel rounded-[2.5rem] px-8 py-14 md:px-16" data-glow>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent" />
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/70">
              <Zap className="h-3 w-3 text-fuchsia-300" />
              Get started today
            </div>
            <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl">
              Your users deserve privacy.
              <br />
              <span className="text-gradient-premium">Now you can give it to them.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-white/50">
              Start with the free tier. No payment required. Upgrade when you're ready to go to
              production.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-rose-300 to-amber-200 px-8 py-4 text-sm font-medium text-black shadow-[0_24px_64px_rgba(251,191,36,0.2)] transition hover:scale-[1.02]"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-8 py-4 text-sm font-light text-white/75 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/8 hover:text-white"
              >
                Talk to the team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingPricing />
      <LandingShowcase />
      <LandingTestimonials />
      <LandingInsights />
      <LandingFaq />
      <LandingMotion />
      <LandingFooter />
    </main>
  );
}
