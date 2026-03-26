"use client";

// ─── DebtCard ───────────────────────────────────────────
// Client Component — displays a single debt with progress bar,
// mark-as-paid, and delete actions.

import { useState, useTransition } from "react";
import { Card, Badge, Button, Input, useToast } from "@/components/ui";
import { markDebtPaid, deleteDebt, recordInstallmentPayment } from "@/lib/actions/debts";
import type { Debt, DebtPayment } from "@/lib/data/debts";

function formatCurrency(amount: number): string {
    return `$${Math.abs(amount).toLocaleString("es-AR")}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("es-AR", {
        day: "numeric", month: "short", year: "numeric",
    });
}

interface DebtCardProps {
    debt: Debt;
    payments: DebtPayment[];
}

export default function DebtCard({ debt, payments }: DebtCardProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [showInstallmentForm, setShowInstallmentForm] = useState(false);
    const [installmentAmount, setInstallmentAmount] = useState("");
    const [installmentNote, setInstallmentNote] = useState("");
    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    const isPaid = debt.status === "paid";
    const paidAmount = payments.reduce(
        (sum, payment) => sum + Number(payment.amount_paid),
        0
    );
    const totalAmount = Number(debt.total_amount);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const progressPct = totalAmount > 0 ? Math.min(100, (paidAmount / totalAmount) * 100) : 0;
    const recentPayments = payments.slice(0, 3);

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

    function handleRecordInstallment() {
        startTransition(async () => {
            const amount = Number(installmentAmount);
            if (!Number.isFinite(amount) || amount <= 0) {
                toast.error("Enter a valid amount");
                return;
            }

            const result = await recordInstallmentPayment(
                debt.id,
                amount,
                installmentNote.trim() || undefined
            );

            if (result.success) {
                toast.success("Installment payment recorded");
                setInstallmentAmount("");
                setInstallmentNote("");
                setShowInstallmentForm(false);
            } else {
                toast.error(result.error ?? "Failed to record payment");
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
                                onClick={() => setShowInstallmentForm((prev) => !prev)}
                                disabled={isPending}
                                className="rounded-md p-1.5 text-xs text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10 transition-colors"
                                title="Pay installment"
                            >
                                💸
                            </button>
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

                {/* Installment form */}
                {!isPaid && showInstallmentForm && (
                    <div className="mb-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                        <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                            Record installment payment
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="0.01"
                                placeholder="Amount"
                                value={installmentAmount}
                                onChange={(event) => setInstallmentAmount(event.target.value)}
                                disabled={isPending}
                            />
                            <Input
                                type="text"
                                placeholder="Note (optional)"
                                value={installmentNote}
                                onChange={(event) => setInstallmentNote(event.target.value)}
                                disabled={isPending}
                            />
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowInstallmentForm(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleRecordInstallment}
                                loading={isPending}
                            >
                                Save payment
                            </Button>
                        </div>
                    </div>
                )}

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

                {/* Mini payment history */}
                {recentPayments.length > 0 && (
                    <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                        <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                            Last payments
                        </p>
                        <div className="space-y-1.5">
                            {recentPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between rounded-md bg-[var(--color-surface-2)] px-2 py-1.5"
                                >
                                    <span className="text-xs text-[var(--color-text-primary)]">
                                        {formatCurrency(Number(payment.amount_paid))}
                                    </span>
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        {new Date(payment.paid_at).toLocaleDateString("es-AR")}
                                    </span>
                                </div>
                            ))}
                        </div>
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
