"use client";

// ─── TransactionRow ─────────────────────────────────────
// Client Component — interactive row for a single transaction.
// Handles edit and delete actions with modals.

import { useState, useTransition } from "react";
import { Badge, Button } from "@/components/ui";
import { deleteTransaction } from "@/lib/actions/transactions";
import TransactionForm from "./TransactionForm";
import type { Transaction, Category } from "@/lib/data/transactions";

interface TransactionRowProps {
    transaction: Transaction;
    categories: Category[];
}

function formatCurrency(amount: number): string {
    return `$${Math.abs(amount).toLocaleString("es-AR")}`;
}

export default function TransactionRow({ transaction: t, categories }: TransactionRowProps) {
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteTransaction(t.id);
            if (result.success) setShowDelete(false);
        });
    }

    return (
        <>
            <div
                className={`group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--color-surface-2)] ${isPending ? "opacity-50" : ""
                    }`}
            >
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {t.description ?? "No description"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={t.type === "income" ? "success" : "default"}>
                            {t.type}
                        </Badge>
                        {t.payment_method && (
                            <Badge variant="info">{t.payment_method}</Badge>
                        )}
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {new Date(t.transaction_date).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Amount + actions */}
                <div className="flex items-center gap-3">
                    <span
                        className={`text-sm font-semibold ${t.type === "income"
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-text-primary)]"
                            }`}
                    >
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </span>

                    {/* Action buttons — appear on hover */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setShowEdit(true)}
                            className="rounded-md p-1.5 text-xs hover:bg-[var(--color-surface-3)] transition-colors"
                            title="Edit"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => setShowDelete(true)}
                            className="rounded-md p-1.5 text-xs hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <TransactionForm
                transaction={t}
                categories={categories}
                open={showEdit}
                onClose={() => setShowEdit(false)}
            />

            {/* Delete Confirmation */}
            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDelete(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Delete Transaction
                        </h3>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            Delete &quot;{t.description ?? "this transaction"}&quot; ({t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)})? This cannot be undone.
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
