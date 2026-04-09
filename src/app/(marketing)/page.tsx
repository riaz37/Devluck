import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <section className="container flex flex-col items-center justify-center gap-6 py-24 md:py-32">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Welcome to {siteConfig.name}
      </h1>
      <p className="max-w-[42rem] text-center text-lg text-muted-foreground sm:text-xl">
        {siteConfig.description}
      </p>
      <div className="flex gap-4">
        <Button size="lg">Get Started</Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>
    </section>
  );
}
