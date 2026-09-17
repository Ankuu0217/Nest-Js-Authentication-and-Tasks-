"use client";

import { useState } from "react";
import { Bell, Inbox, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { SlideOver } from "@/components/ui/SlideOver";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { toast } from "@/components/ui/Toast";

const BUTTON_VARIANTS = ["filled", "ghost", "outlined-violet", "neutral-bordered", "destructive"] as const;
const BUTTON_SIZES = ["sm", "md", "lg"] as const;
const BADGE_TONES = [
  "neutral", "violet", "pink", "tangerine", "aqua", "sky", "sunshine", "mint", "success", "danger",
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-b border-sand-gray py-10">
      <h2 className="font-display text-heading-sm text-ink-black">{title}</h2>
      {children}
    </section>
  );
}

export default function KitchenSinkPage() {
  const [tab, setTab] = useState("todo");
  const [slideOpen, setSlideOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-4 space-y-2">
        <Badge tone="violet" shape="pill">
          Internal — not linked from any page
        </Badge>
        <h1 className="font-display text-display text-ink-black">Kitchen sink</h1>
        <p className="text-body text-charcoal-stone">
          Every UI primitive, every variant, every state. This is where a regression shows up
          first.
        </p>
      </header>

      <Section title="Buttons">
        <div className="space-y-4">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <span className="w-36 shrink-0 text-caption text-charcoal-stone">{variant}</span>
              {BUTTON_SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  Button
                </Button>
              ))}
              <Button variant={variant} loading>
                Loading
              </Button>
              <Button variant={variant} disabled>
                Disabled
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Inputs, textarea, select">
        <div className="grid max-w-md gap-6">
          <div>
            <Label htmlFor="ks-input">Default</Label>
            <Input id="ks-input" placeholder="you@example.com" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ks-input-error">Error state</Label>
            <Input id="ks-input-error" defaultValue="not-an-email" aria-invalid aria-describedby="ks-input-error-msg" />
            <FieldError id="ks-input-error-msg">Enter a valid email address.</FieldError>
          </div>
          <div>
            <Label htmlFor="ks-input-disabled">Disabled</Label>
            <Input id="ks-input-disabled" placeholder="Disabled" disabled />
          </div>
          <div>
            <Label htmlFor="ks-textarea">Textarea</Label>
            <Textarea id="ks-textarea" placeholder="Describe the task…" />
          </div>
          <div>
            <Label htmlFor="ks-select">Select</Label>
            <Select id="ks-select" defaultValue="todo">
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Tasks completed</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </div>
              <Badge tone="success">+54%</Badge>
            </CardHeader>
            <p className="font-display text-heading text-ink-black">18</p>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Empty card</CardTitle>
            </CardHeader>
            <CardDescription>Just body content, no metric.</CardDescription>
          </Card>
        </div>
      </Section>

      <Section title="Badges / pills">
        <div className="flex flex-wrap gap-2">
          {BADGE_TONES.map((tone) => (
            <Badge key={`tag-${tone}`} tone={tone} shape="tag">
              {tone}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {BADGE_TONES.map((tone) => (
            <Badge key={`pill-${tone}`} tone={tone} shape="pill">
              {tone}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex items-center gap-3">
          {["user-a", "user-b", "user-c", "user-d", "user-e"].map((id) => (
            <Avatar key={id} userId={id} name={id.replace("-", " ")} />
          ))}
          <Avatar userId="user-a" name="Ankit Singh" size="sm" />
          <Avatar userId="user-a" name="Ankit Singh" size="lg" />
        </div>
      </Section>

      <Section title="Skeleton / spinner">
        <div className="flex items-center gap-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="size-10 rounded-full" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="todo">To do</TabsTrigger>
            <TabsTrigger value="in_progress">In progress</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
          <TabsContent value="todo" className="pt-4 text-body-sm text-charcoal-stone">
            Panel: to do.
          </TabsContent>
          <TabsContent value="in_progress" className="pt-4 text-body-sm text-charcoal-stone">
            Panel: in progress.
          </TabsContent>
          <TabsContent value="done" className="pt-4 text-body-sm text-charcoal-stone">
            Panel: done.
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Empty states">
        <EmptyState
          icon={<Inbox className="size-6" aria-hidden="true" />}
          title="No tasks yet"
          description="Create your first task to see it here."
          action={<Button size="sm">New task</Button>}
        />
      </Section>

      <Section title="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Open user menu"
            className="rounded-xl border border-sand-gray bg-paper-white p-2 text-ink-black hover:bg-linen-beige"
          >
            <User className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Refresh session</DropdownMenuItem>
            <DropdownMenuItem destructive>
              <Trash2 className="size-4" aria-hidden="true" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="Slide-over">
        <Button onClick={() => setSlideOpen(true)}>Open slide-over</Button>
        <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title="New task">
          <div className="space-y-4">
            <div>
              <Label htmlFor="ks-slideover-title">Title</Label>
              <Input id="ks-slideover-title" placeholder="Ship the landing page" />
            </div>
            <div>
              <Label htmlFor="ks-slideover-desc">Description</Label>
              <Textarea id="ks-slideover-desc" placeholder="…" />
            </div>
            <Button onClick={() => setSlideOpen(false)}>Create task</Button>
          </div>
        </SlideOver>
      </Section>

      <Section title="Toasts">
        <div className="flex flex-wrap gap-3">
          <Button size="sm" onClick={() => toast("Task created")}>
            Default
          </Button>
          <Button size="sm" onClick={() => toast.success("Task moved to Done")}>
            Success
          </Button>
          <Button size="sm" onClick={() => toast.error("Failed to save task")}>
            Error
          </Button>
          <Button
            size="sm"
            onClick={() =>
              toast("Task deleted", {
                action: { label: "Undo", onClick: () => toast("Task restored") },
              })
            }
          >
            With undo action
          </Button>
          <Button size="sm" variant="neutral-bordered" onClick={() => toast(<span className="flex items-center gap-2"><Bell className="size-4" aria-hidden="true" />Reminder set</span>)}>
            With icon
          </Button>
        </div>
      </Section>
    </main>
  );
}
