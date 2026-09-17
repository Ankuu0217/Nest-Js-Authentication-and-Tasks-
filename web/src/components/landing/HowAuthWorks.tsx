"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

const STEPS = [
  {
    id: "register",
    label: "1. Register",
    request: `POST /api/auth/register
{ "email": "you@example.com", "password": "••••••", "name": "You", "role": "user" }`,
    response: `201 Created
{ "message": "User registered successfully" }`,
  },
  {
    id: "verify",
    label: "2. Verify",
    request: `GET /api/auth?token=<64-char hex>`,
    response: `200 OK
{ "accessToken": "eyJhbGci...", "user": { "id", "email", "name", "role" } }
Set-Cookie: refresh_token=eyJhbGci...; HttpOnly; SameSite=Strict`,
  },
  {
    id: "login",
    label: "3. Login",
    request: `POST /api/auth/login
{ "email": "you@example.com", "password": "••••••" }`,
    response: `200 OK
{ "accessToken": "eyJhbGci...", "user": { "id", "email", "name", "role" } }
Set-Cookie: refresh_token=eyJhbGci...; HttpOnly; SameSite=Strict`,
  },
  {
    id: "access",
    label: "4. Access token",
    request: `GET /api/tasks
Authorization: Bearer eyJhbGci...`,
    response: `200 OK
[ { "id", "title", "description", "status", "createdAt", "updatedAt" }, ... ]`,
  },
  {
    id: "refresh",
    label: "5. Silent refresh",
    request: `POST /api/auth/refresh
Cookie: refresh_token=eyJhbGci...`,
    response: `200 OK
{ "accessToken": "eyJhbGci... (new)", "user": {...} }
Set-Cookie: refresh_token=eyJhbGci... (rotated); HttpOnly; SameSite=Strict`,
  },
];

const FIRST_STEP_ID = STEPS[0]?.id ?? "register";

export function HowAuthWorks() {
  const [active, setActive] = useState(FIRST_STEP_ID);

  return (
    <section className="relative bg-gradient-to-b from-twilight-indigo via-deep-violet/40 to-parchment-cream py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-sand-gray bg-paper-white p-6 shadow-subtle-3 sm:p-8">
          <h2 className="font-display text-heading-sm text-ink-black">How auth actually works</h2>
          <p className="mt-2 text-body-sm text-charcoal-stone">
            Real requests and responses from the five methods on <code className="text-caption">AuthController</code>.
          </p>

          <Tabs value={active} onValueChange={setActive} className="mt-6">
            <TabsList className="flex-wrap gap-x-4 border-b-0">
              {STEPS.map((s) => (
                <TabsTrigger key={s.id} value={s.id}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-2 border-b border-sand-gray" />
            {STEPS.map((s) => (
              <TabsContent key={s.id} value={s.id} className="mt-5 space-y-3">
                <div>
                  <p className="text-caption font-medium text-charcoal-stone">Request</p>
                  <pre className="mt-1.5 overflow-x-auto rounded-xl bg-ink-black px-4 py-3 text-caption text-parchment-cream">
                    {s.request}
                  </pre>
                </div>
                <div>
                  <p className="text-caption font-medium text-charcoal-stone">Response</p>
                  <pre className="mt-1.5 overflow-x-auto rounded-xl bg-ink-black px-4 py-3 text-caption text-mint-green">
                    {s.response}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
