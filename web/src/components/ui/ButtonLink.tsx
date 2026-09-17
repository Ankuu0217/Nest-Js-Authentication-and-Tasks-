import Link from "next/link";
import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";

export type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/** A same-styled sibling to <Button>, for the very common case of a link
 * that should look like one — kept separate rather than making Button
 * polymorphic, since every use here is either a Link or a plain <a>. */
export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
