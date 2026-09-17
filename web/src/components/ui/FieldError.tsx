export interface FieldErrorProps {
  id?: string;
  children?: React.ReactNode;
}

export function FieldError({ id, children }: FieldErrorProps) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-caption text-coral-red-text">
      {children}
    </p>
  );
}
