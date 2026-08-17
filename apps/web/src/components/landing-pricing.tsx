import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    subtitle: 'For demos and pilots',
    features: ['Stealth address generation', 'Scanner events', 'Single workspace'],
    cta: 'Start free',
    href: '/login',
    featured: false,
  },
  {
    name: 'Scale',
    price: '$99',
    subtitle: 'Per month · team tier',
    features: ['Policy controls', 'Priority scanner queue', 'Ops observability'],
    cta: 'Choose Scale',
    href: '/login',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'Security + compliance teams',
    features: ['Dedicated infra', 'Security onboarding', 'SLA-backed support'],
    cta: 'Contact sales',
    href: '#contact',
    featured: false,
  },
] as const;

const compareRows = [
  ['Stealth Addressing', 'Core', 'Advanced', 'Advanced'],
  ['Scanner Throughput', 'Standard', 'Priority', 'Dedicated'],
  ['Policy Layer', 'Basic', 'Extended', 'Custom'],
  ['Support', 'Community', 'Priority', 'Dedicated'],
] as const;

export function LandingPricing(): React.JSX.Element {
  return (
    <section id="pricing" className="relative px-6 py-24 md:px-8" data-reveal>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4" data-reveal>
          <Badge variant="accent" className="w-fit gap-2 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Pricing
          </Badge>
          <h2 className="max-w-3xl text-3xl font-light tracking-tight text-white md:text-5xl">
            Product tiers designed for stealth-payment teams at every stage.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3" data-reveal>
          {plans.map((plan) => (
            <Card
              key={plan.name}
              data-glow
              className={
                plan.featured
                  ? 'ring-1 ring-fuchsia-300/30 bg-gradient-to-b from-fuchsia-400/12 to-white/[0.04]'
                  : ''
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.featured ? <Badge variant="accent">Popular</Badge> : null}
                </div>
                <div className="text-3xl font-light text-white">{plan.price}</div>
                <CardDescription>{plan.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-white/75">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-cyan-200" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link
                  href={plan.href}
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition',
                    plan.featured
                      ? 'bg-gradient-to-r from-fuchsia-400 via-rose-300 to-amber-200 text-black'
                      : 'border border-white/12 bg-white/5 text-white/88 hover:border-white/22',
                  ].join(' ')}
                >
                  {plan.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="mt-8" data-reveal data-glow>
          <CardHeader>
            <CardTitle className="text-lg">Quick compare</CardTitle>
            <CardDescription>See what changes as your privacy operations scale.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-4 gap-4 px-2 text-xs uppercase tracking-[0.2em] text-white/40">
                <div>Capability</div>
                <div>Starter</div>
                <div>Scale</div>
                <div>Enterprise</div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3 text-sm">
                {compareRows.map((row) => (
                  <div
                    key={row[0]}
                    className="grid grid-cols-4 gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-white/75"
                  >
                    <div className="text-white/55">{row[0]}</div>
                    <div>{row[1]}</div>
                    <div>{row[2]}</div>
                    <div>{row[3]}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
