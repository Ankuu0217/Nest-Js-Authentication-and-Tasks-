import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: keyof typeof SIZE_MAP;
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(SIZE_MAP[size], "animate-spin", className)}
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-20"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
