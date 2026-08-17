'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const faqItems = [
  {
    value: 'item-1',
    q: 'What privacy does stealth addressing improve?',
    a: 'It reduces deterministic address reuse and makes inbound payment linking significantly harder for external observers.',
  },
  {
    value: 'item-2',
    q: 'Do we replace BitGo wallet infrastructure?',
    a: 'No. Wallet operations remain on BitGo rails while stealth derivation and scanning are layered into the payment workflow.',
  },
  {
    value: 'item-3',
    q: 'Is this deployable as a product foundation?',
    a: 'Yes. The architecture uses typed APIs, auth boundaries, and modular scanner services designed for iterative production hardening.',
  },
] as const;

export function LandingFaq(): React.JSX.Element {
  return (
    <section id="faq" className="relative px-6 py-24 md:px-8" data-reveal>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <Card data-glow>
          <CardHeader>
            <Badge variant="cyan" className="w-fit">
              FAQ
            </Badge>
            <CardTitle className="text-3xl md:text-4xl">
              Answers for product, engineering, and security teams.
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <Accordion.Root type="single" collapsible className="space-y-3">
              {faqItems.map((item) => (
                <Accordion.Item
                  key={item.value}
                  value={item.value}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between px-4 py-3 text-left text-sm font-light text-white md:text-base">
                      {item.q}
                      <ChevronDown className="h-4 w-4 text-white/55 transition duration-300 group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="accordion-content overflow-hidden px-4 pb-4 text-sm leading-7 text-white/60">
                    {item.a}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </Card>

        <Card data-glow>
          <CardHeader>
            <Badge variant="subtle" className="w-fit">
              Need deeper review?
            </Badge>
            <CardTitle className="text-xl">Architecture walkthrough with your team.</CardTitle>
            <CardDescription>
              We can walk through stealth derivation, scanner flows, and production rollout
              sequence.
            </CardDescription>
            <a
              href="#contact"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-white/22"
            >
              <MessageCircle className="h-4 w-4" />
              Book a review
            </a>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
