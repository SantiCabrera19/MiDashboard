// ─── UI Components — Barrel Export ──────────────────────
// Re-export all design system components from a single entry point.
//
// USAGE:
//   import { Button, Card, Badge } from "@/components/ui";
//
// WHY barrel exports?
// - Clean imports (1 line instead of 7)
// - Easy to refactor internal file structure without breaking imports
// - Single source of truth for available components

export { default as Button } from "./Button";
export { default as Card } from "./Card";
export { default as Badge } from "./Badge";
export { default as Input } from "./Input";
export { default as Modal } from "./Modal";
export { default as EmptyState } from "./EmptyState";
export { default as Skeleton } from "./Skeleton";
export { useToast, ToastProvider } from "./Toast";
