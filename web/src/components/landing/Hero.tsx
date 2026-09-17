import type { Route } from "next";
import { ArrowUpRight, Send } from "lucide-react";
import { TwilightSky } from "@/components/illustrations/TwilightSky";
import { Mascot } from "@/components/illustrations/Mascot";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { env } from "@/env";

const NEST_DOCS_URL = `${env.NEST_API_URL}/api/docs` as Route;

function MetricCard() {
  return (
    <div className="w-44 -rotate-2 rounded-xl border border-sand-gray bg-paper-white p-4 shadow-subtle lg:w-52 lg:rounded-2xl lg:p-5 xl:w-56">
      <p className="text-caption text-charcoal-stone lg:text-body-sm">Tasks completed</p>
      <p className="mt-1 font-display text-heading-sm text-ink-black lg:text-heading">18</p>
      <p className="mt-1 text-caption font-medium text-forest-green lg:text-body-sm">+54%</p>
    </div>
  );
}

function ChartCard() {
  const bars = [40, 65, 45, 80, 60, 90];
  return (
    <div className="w-44 rotate-[1.5deg] rounded-xl border border-sand-gray bg-paper-white p-4 shadow-subtle lg:w-52 lg:rounded-2xl lg:p-5 xl:w-56">
      <p className="text-caption text-charcoal-stone lg:text-body-sm">This week</p>
      <div className="mt-3 flex h-16 items-end gap-1.5 lg:h-20 lg:gap-2">
        {bars.map((h, i) => (
          <div
            key={i}
            className={i === bars.length - 1 ? "flex-1 rounded-t bg-electric-violet" : "flex-1 rounded-t bg-tangerine"}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function AddTaskCard() {
  return (
    <div className="flex w-64 -rotate-1 items-center gap-3 rounded-xl border border-sand-gray bg-paper-white p-3 shadow-subtle lg:w-72 lg:gap-4 lg:rounded-2xl lg:p-4 xl:w-80">
      <span className="flex-1 truncate text-body-sm text-charcoal-stone lg:text-body">Write the launch announcement</span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-black text-paper-white lg:size-10">
        <Send className="size-3.5 lg:size-4" aria-hidden="true" />
      </span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative bg-twilight-indigo pt-28 pb-40 sm:pt-36">
      <TwilightSky />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-caption text-parchment-cream backdrop-blur-sm">
          Open source · NestJS + Next.js
        </span>

        <h1 className="mt-6 font-display text-[40px] leading-tight tracking-tight text-paper-white sm:text-5xl lg:text-[64px] lg:tracking-[-0.023em]">
          A task API, and a front end worth showing it in.
        </h1>

        <p className="mt-6 max-w-[52ch] text-base text-parchment-cream/80 sm:text-lg">
          JWT auth with rotating refresh tokens, bcrypt hashing, and rate limiting on a NestJS
          API — fronted by a Next.js BFF that never lets a token touch the browser.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/register" size="lg" className="shadow-subtle-3">
            Start for free
          </ButtonLink>
          <ButtonLink
            href={NEST_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="lg"
            className="text-paper-white hover:bg-white/10"
          >
            View the API docs
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>

      <div className="relative z-10 mt-16 hidden items-start justify-center gap-6 px-6 sm:flex lg:mt-20 lg:gap-8">
        <MetricCard />
        <ChartCard />
        <AddTaskCard />
      </div>
      <p className="relative z-10 mt-4 hidden text-center text-caption text-parchment-cream/50 sm:block lg:mt-6 lg:text-body-sm">
        What the dashboard looks like — same components, real data once you&apos;re signed in.
      </p>

      <Mascot
        size={140}
        className="absolute right-4 bottom-4 z-10 sm:right-10 sm:bottom-0 sm:translate-y-1/3"
      />
    </section>
  );
}
