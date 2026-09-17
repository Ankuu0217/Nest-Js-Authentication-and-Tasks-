import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { env } from "@/env";

const NEST_DOCS_URL = `${env.NEST_API_URL}/api/docs` as Route;
const GITHUB_URL = "https://github.com/Ankuu0217";
const LINKEDIN_URL = "https://www.linkedin.com/in/ankit-singh-0216072a6/";

export function CtaFooter() {
  return (
    <footer className="bg-twilight-indigo text-parchment-cream">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-display text-heading text-paper-white">See it running</h2>
        <p className="mx-auto mt-3 max-w-md text-body-sm text-parchment-cream/70">
          Register, verify, and drag a task across the board — the whole flow is real.
        </p>
        <ButtonLink href="/register" size="lg" className="mt-8">
          Start for free
        </ButtonLink>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="inline-flex items-center gap-2 text-body font-bold text-paper-white">
              <Logo className="size-6" />
              MyTask
            </span>
            <p className="mt-3 max-w-xs text-body-sm text-parchment-cream/60">
              A NestJS auth and task API with a Next.js front end built to match it.
            </p>
          </div>

          <div>
            <p className="text-caption font-semibold tracking-wide text-parchment-cream/50 uppercase">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-body-sm">
              <li>
                <Link href="/register" className="text-parchment-cream/80 hover:text-paper-white">
                  Create an account
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-parchment-cream/80 hover:text-paper-white">
                  Log in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-caption font-semibold tracking-wide text-parchment-cream/50 uppercase">
              Resources
            </p>
            <ul className="mt-3 space-y-2 text-body-sm">
              <li>
                <a
                  href={NEST_DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-parchment-cream/80 hover:text-paper-white"
                >
                  API docs
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-caption font-semibold tracking-wide text-parchment-cream/50 uppercase">
              Connect
            </p>
            <ul className="mt-3 space-y-2 text-body-sm">
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-parchment-cream/80 hover:text-paper-white"
                >
                  GitHub
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-parchment-cream/80 hover:text-paper-white"
                >
                  LinkedIn
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
