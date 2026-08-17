import { Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const testimonials = [
  {
    quote:
      'Stealth addressing gave us real privacy differentiation without replacing wallet operations.',
    author: 'Head of Payments',
    company: 'Fintech Team',
  },
  {
    quote: 'The scanner-first architecture made detection understandable for both ops and product.',
    author: 'Engineering Manager',
    company: 'Treasury Ops',
  },
  {
    quote: 'Design quality made the protocol story immediately credible in stakeholder demos.',
    author: 'Product Lead',
    company: 'Crypto Infra',
  },
] as const;

export function LandingTestimonials(): React.JSX.Element {
  return (
    <section id="testimonials" className="relative px-6 py-24 md:px-8" data-reveal>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 space-y-4" data-reveal>
          <Badge variant="cyan" className="w-fit">
            Testimonials
          </Badge>
          <h2 className="max-w-3xl text-3xl font-light tracking-tight text-white md:text-5xl">
            Teams trust the product because the experience feels as rigorous as the protocol.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3" data-reveal>
          <Card className="lg:col-span-2" data-glow>
            <CardHeader>
              <Quote className="h-5 w-5 text-fuchsia-200" />
              <CardTitle className="text-2xl md:text-3xl">“{testimonials[0].quote}”</CardTitle>
              <CardDescription>
                {testimonials[0].author} · {testimonials[0].company}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-5">
            {testimonials.slice(1).map((item) => (
              <Card key={item.author} data-glow>
                <CardHeader>
                  <CardTitle className="text-lg">“{item.quote}”</CardTitle>
                  <CardDescription>
                    {item.author} · {item.company}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
