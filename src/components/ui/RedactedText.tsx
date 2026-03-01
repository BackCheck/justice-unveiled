import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface RedactedTextProps {
  children: string;
  className?: string;
  as?: "span" | "p" | "div";
}

/**
 * Renders text as redacted (blurred) for unauthenticated users.
 * Shows full text for logged-in users.
 */
export const RedactedText = ({ children, className, as: Tag = "span" }: RedactedTextProps) => {
  const { user } = useAuth();

  if (user) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag
      className={cn("select-none blur-[6px] opacity-70", className)}
      aria-label="Login to view"
    >
      {children}
    </Tag>
  );
};

/**
 * Returns redacted text (replaced with placeholder) for unauthenticated users.
 */
export function useRedactedText() {
  const { user } = useAuth();

  const redact = (text: string, placeholder?: string): string => {
    if (user) return text;
    return placeholder || "••••••••••";
  };

  const isRedacted = !user;

  return { redact, isRedacted };
}
