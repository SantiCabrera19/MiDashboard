"use client";

// ─── DebtCard ───────────────────────────────────────────
// Client Component — displays a single debt with progress bar,
// mark-as-paid, and delete actions.

import { useState, useTransition } from "react";
import { Card, Badge, Button, useToast } from "@/components/ui";
import { markDebtPaid, deleteDebt } from "@/lib/actions/debts";
import type { Debt } from "@/lib/data/debts";

function formatCurrency(amount: number): string {
    return `$${Math.abs(amount).toLocaleString("es-AR")}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("es-AR", {
        day: "numeric", month: "short", year: "numeric",
    });
}

export default function DebtCard({ debt }: { debt: Debt }) {
    const [showDelete, setShowDelete] = useState(false);
    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    const isPaid = debt.status === "paid";
    const paidAmount = Number(debt.paid_amount ?? 0);
    const totalAmount = Number(debt.total_amount);
    const remainingAmount = Number(debt.remaining_amount ?? (totalAmount - paidAmount));
    const progressPct = totalAmount > 0 ? Math.min(100, (paidAmount / totalAmount) * 100) : 0;

    function handleMarkPaid() {
        startTransition(async () => {
            const result = await markDebtPaid(debt.id);
            if (result.success) toast.success("Debt marked as paid");
            else toast.error(result.error ?? "Failed to update debt");
        });
    }

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteDebt(debt.id);
            if (result.success) {
                setShowDelete(false);
                toast.success("Debt deleted");
            } else {
                toast.error(result.error ?? "Failed to delete debt");
            }
        });
    }

    return (
        <>
            <Card className={`${isPending ? "opacity-50" : ""} ${isPaid ? "opacity-70" : ""}`}>
                {/* Header — title, badge, actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                {debt.title}
                            </h3>
                            <Badge variant={isPaid ? "success" : "warning"}>
                                {isPaid ? "Paid" : "Active"}
                            </Badge>
                        </div>
                        {debt.notes && (
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                                {debt.notes}
                            </p>
                        )}
                    </div>
                    {!isPaid && (
                        <div className="flex gap-1 shrink-0">
                            <button
                                onClick={handleMarkPaid}
                                disabled={isPending}
                                className="rounded-md p-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                title="Mark as paid"
                            >
                                ✓
                            </button>
                            <button
                                onClick={() => setShowDelete(true)}
                                disabled={isPending}
                                className="rounded-md p-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {debt.installments_paid !== null && debt.installments_total !== null
                                ? `${debt.installments_paid}/${debt.installments_total} installments`
                                : "Progress"}
                        </span>
                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                            {Math.round(progressPct)}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-3)]">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${isPaid ? "bg-emerald-500" : "bg-[var(--color-brand)]"}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                {/* Amount breakdown */}
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Total</p>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {formatCurrency(totalAmount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Paid</p>
                        <p className="text-sm font-semibold text-emerald-400">
                            {formatCurrency(paidAmount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Remaining</p>
                        <p className={`text-sm font-semibold ${isPaid ? "text-emerald-400" : "text-red-400"}`}>
                            {isPaid ? "$0" : formatCurrency(remainingAmount)}
                        </p>
                    </div>
                </div>

                {/* Footer — monthly payment + due date */}
                {(debt.monthly_payment || debt.next_due_date) && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center gap-4 flex-wrap">
                        {debt.monthly_payment && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                                💳 {formatCurrency(Number(debt.monthly_payment))}/month
                            </span>
                        )}
                        {debt.next_due_date && !isPaid && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                                📅 Due {formatDate(debt.next_due_date)}
                            </span>
                        )}
                    </div>
                )}
            </Card>

            {/* Delete confirmation overlay */}
            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDelete(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Delete Debt
                        </h3>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            Delete &quot;{debt.title}&quot;? This cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowDelete(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDelete} loading={isPending}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
