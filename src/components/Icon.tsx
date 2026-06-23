import { icons, type LucideProps } from "lucide-react";

/** Render any lucide icon by its PascalCase name (e.g. "Flame", "Sigma"). */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? icons.Circle;
  return <Cmp {...props} />;
}
