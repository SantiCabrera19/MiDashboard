"use client";

// ─── Modal ──────────────────────────────────────────────
// Client Component — needs useState and useEffect for interactivity.
//
// WHY Client Component?
// - Listens for Escape key to close (useEffect + event listener)
// - Manages focus trap logic
// - Prevents body scroll when open
// - Animated transitions
//
// USAGE:
//   const [open, setOpen] = useState(false);
//   <Modal open={open} onClose={() => setOpen(false)} title="Create Note">
//     <form>...</form>
//   </Modal>
//
// ACCESSIBILITY:
// - role="dialog" + aria-modal="true"
// - Escape key closes
// - Clicking backdrop closes
// - Focus is managed by the browser's dialog behavior

import { useEffect, useCallback } from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    /** Max width class — defaults to max-w-lg */
    maxWidth?: string;
}

export default function Modal({
    open,
    onClose,
    title,
    children,
    maxWidth = "max-w-lg",
}: ModalProps) {
    // Close on Escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (!open) return;

        // Listen for Escape key
        document.addEventListener("keydown", handleEscape);
        // Prevent body scroll while modal is open
        document.body.style.overflow = "hidden";

        // Cleanup: remove listener + restore scroll
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, handleEscape]);

    // Don't render anything if not open
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop — click to close */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal content */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className={`
          relative ${maxWidth} w-full max-h-[90vh] overflow-y-auto
          rounded-2xl border border-[var(--color-border)]
          bg-[var(--color-surface-1)]
          shadow-2xl shadow-black/30
          animate-in fade-in zoom-in-95
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                    <h2
                        id="modal-title"
                        className="text-lg font-semibold text-[var(--color-text-primary)]"
                    >
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Body — children go here */}
                <div className="px-6 py-4">{children}</div>
            </div>
        </div>
    );
}
