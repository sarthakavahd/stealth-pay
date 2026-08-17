import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const posts = [
  {
    title: 'Stealth addressing as product UX, not just cryptography',
    tag: 'Architecture',
    read: '6 min read',
    href: '#',
  },
  {
    title: 'Scanner-first operating model for inbound payment intelligence',
    tag: 'Engineering',
    read: '8 min read',
    href: '#',
  },
  {
    title: 'How to position privacy features for enterprise trust decisions',
    tag: 'Product',
    read: '5 min read',
    href: '#',
  },
] as const;

export function LandingInsights(): React.JSX.Element {
  return (
    <section id="insights" className="relative px-6 py-24 md:px-8" data-reveal>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 space-y-4" data-reveal>
          <Badge variant="accent" className="w-fit">
            Blog
          </Badge>
          <h2 className="max-w-2xl text-3xl font-light tracking-tight text-white md:text-5xl">
            Insights for teams building private payment products.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3" data-reveal>
          <Card className="lg:col-span-2" data-glow>
            <CardHeader>
              <Badge variant="subtle" className="w-fit">
                {posts[0].tag}
              </Badge>
              <CardTitle className="text-2xl md:text-3xl">{posts[0].title}</CardTitle>
              <CardDescription>{posts[0].read}</CardDescription>
              <Link
                href={posts[0].href}
                className="mt-1 inline-flex items-center gap-2 text-sm text-cyan-100 transition hover:text-white"
              >
                Read article
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardHeader>
          </Card>

          <div className="space-y-5">
            {posts.slice(1).map((post) => (
              <Card key={post.title} data-glow>
                <CardHeader>
                  <Badge variant="subtle" className="w-fit">
                    {post.tag}
                  </Badge>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription>{post.read}</CardDescription>
                  <Link
                    href={post.href}
                    className="inline-flex items-center gap-2 text-sm text-cyan-100 transition hover:text-white"
                  >
                    Read article
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
