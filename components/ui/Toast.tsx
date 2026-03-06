"use client";

// ─── Toast Notification System ──────────────────────────
// Context-based toast system. Zero dependencies.
//
// USAGE:
//   import { useToast } from "@/components/ui/Toast";
//   const toast = useToast();
//   toast.success("Note created!");
//   toast.error("Something went wrong");
//   toast.info("Syncing videos...");
//
// ARCHITECTURE:
// - ToastProvider wraps the app at layout level
// - useToast() returns { success, error, info } methods
// - Toasts auto-dismiss after 4 seconds
// - Uses CSS animations (no framer-motion dep)
// - Stacks from bottom-right, max 3 visible

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";

// ─── Types ──────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

// ─── Context ────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within <ToastProvider>");
    }
    return ctx;
}

// ─── Provider ───────────────────────────────────────────

const TOAST_DURATION = 4000;
const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, type, message }]);

        // Auto-dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_DURATION);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value: ToastContextValue = {
        success: useCallback((msg: string) => addToast("success", msg), [addToast]),
        error: useCallback((msg: string) => addToast("error", msg), [addToast]),
        info: useCallback((msg: string) => addToast("info", msg), [addToast]),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast container — fixed bottom-right */}
            <div
                className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none"
                aria-live="polite"
            >
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// ─── Toast Item ─────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
};

const STYLES: Record<ToastType, string> = {
    success: "border-emerald-500/30 bg-emerald-500/10",
    error: "border-red-500/30 bg-red-500/10",
    info: "border-blue-500/30 bg-blue-500/10",
};

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: Toast;
    onDismiss: (id: string) => void;
}) {
    return (
        <div
            className={`
        pointer-events-auto
        flex items-center gap-3
        rounded-xl border px-4 py-3
        shadow-lg shadow-black/20
        backdrop-blur-md
        animate-[slideIn_0.3s_ease-out]
        transition-all duration-200
        min-w-[280px] max-w-[400px]
        ${STYLES[toast.type]}
      `}
        >
            <span className="text-base shrink-0">{ICONS[toast.type]}</span>
            <p className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">
                {toast.message}
            </p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors text-xs"
                aria-label="Dismiss"
            >
                ✕
            </button>
        </div>
    );
}
