import {
  BadgeCheck,
  Building2,
  ChartNoAxesCombined,
  Cpu,
  Globe,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const matrix = [
  {
    title: 'Stealth layer',
    text: 'One-time derived outputs per payment with deterministic receiver recovery.',
  },
  {
    title: 'Execution rails',
    text: 'Wallet orchestration remains on proven institutional infrastructure.',
  },
  {
    title: 'Detection loop',
    text: 'View-key scanning keeps spend authority isolated from monitoring.',
  },
] as const;

const useCases = [
  {
    icon: ShieldCheck,
    title: 'Treasury settlement',
    body: 'Protect high-value inflows from static receive-address correlation.',
  },
  {
    icon: Building2,
    title: 'Partner payouts',
    body: 'Deliver merchant payouts while keeping payment graph exposure lower.',
  },
  {
    icon: Globe,
    title: 'Global collections',
    body: 'Accept BTC globally with cleaner metadata boundaries.',
  },
] as const;

const highlights = [
  { icon: Rocket, value: 'Launch-ready UI', note: 'Minimal friction onboarding' },
  { icon: Cpu, value: 'Composable services', note: 'Fast engineering iteration' },
  { icon: ChartNoAxesCombined, value: 'Operational signal', note: 'Readable state and flow' },
] as const;

export function LandingShowcase(): React.JSX.Element {
  return (
    <section id="signal" className="relative px-6 py-24 md:px-8" data-reveal>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <Card data-glow>
          <CardHeader>
            <Badge variant="cyan" className="w-fit">
              Platform matrix
            </Badge>
            <CardTitle className="text-3xl md:text-4xl">
              From cryptography to product clarity.
            </CardTitle>
            <CardDescription className="max-w-2xl">
              Distinct layers make the system easier to trust, explain, and ship.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {matrix.map((item, index) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/60">
                    {index + 1}
                  </span>
                  <div className="text-white">{item.title}</div>
                </div>
                <p className="text-sm leading-7 text-white/58">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card data-glow>
            <CardHeader>
              <CardTitle className="text-xl">Use-case catalog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {useCases.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-white">
                      <Icon className="h-4 w-4 text-cyan-200" />
                      {item.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/55">{item.body}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card data-glow>
            <CardHeader>
              <CardTitle className="text-xl">Signal panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.value}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-fuchsia-200" />
                        <div className="text-sm text-white/88">{item.value}</div>
                      </div>
                      <div className="text-xs text-white/45">{item.note}</div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center gap-2 text-xs text-emerald-200/80">
                <BadgeCheck className="h-4 w-4" />
                Scanner and dashboard remain operation-ready by default.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
