import { Badge } from "@/components/ui/Badge";

interface PreviewTask {
  title: string;
  description: string;
  tone: "neutral" | "sunshine" | "success";
  label: string;
}

const COLUMNS: { title: string; tasks: PreviewTask[] }[] = [
  {
    title: "To do",
    tasks: [
      { title: "Design the OG image", description: "Twilight gradient, serif title, 1200×630.", tone: "neutral", label: "To do" },
      { title: "Write the security section copy", description: "Keep it to five honest bullets.", tone: "neutral", label: "To do" },
    ],
  },
  {
    title: "In progress",
    tasks: [
      { title: "Wire the refresh-on-401 test", description: "Expire the access token, confirm the replay fires.", tone: "sunshine", label: "In progress" },
    ],
  },
  {
    title: "Done",
    tasks: [
      { title: "Ship the BFF proxy", description: "Cookies, refresh rotation, session-expired handling.", tone: "success", label: "Done" },
      { title: "Add the tasks board", description: "Drag-and-drop, optimistic updates, undo.", tone: "success", label: "Done" },
    ],
  },
];

/** Static replica of the real /tasks board — same tokens and card shape as
 * TaskCard, no drag-and-drop wiring, so it can't be mistaken for the real
 * thing while still looking exactly like it. */
export function TaskBoardPreview() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display text-heading text-ink-black">The board itself</h2>
        <p className="mt-2 max-w-lg text-body-sm text-charcoal-stone">
          A static preview — the real one at <code className="text-caption">/tasks</code> drags
          between columns and undoes a delete.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3" aria-hidden="true">
          {COLUMNS.map((column) => (
            <div key={column.title} className="rounded-2xl border border-sand-gray bg-linen-beige/40 p-3">
              <h3 className="px-1 text-body-sm font-semibold text-ink-black">{column.title}</h3>
              <div className="mt-3 flex flex-col gap-3">
                {column.tasks.map((task) => (
                  <div key={task.title} className="rounded-xl border border-sand-gray bg-paper-white p-4 shadow-subtle-2">
                    <p className="text-[15px] font-semibold text-ink-black">{task.title}</p>
                    <p className="mt-1.5 line-clamp-2 text-body-sm text-charcoal-stone">{task.description}</p>
                    <div className="mt-3">
                      <Badge tone={task.tone}>{task.label}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
