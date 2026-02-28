// ─── Finances Page ──────────────────────────────────────
// Server Component — fetches REAL financial data from Supabase.
// Route: /finances
//
// Uses parallel data fetching with Promise.all for performance.
// Three queries run simultaneously instead of sequentially.

import type { Metadata } from "next";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { getTransactions, getMonthlySummary } from "@/lib/data/transactions";

export const metadata: Metadata = {
    title: "Finances",
    description: "Track income, expenses, debts, and financial goals.",
};

function formatCurrency(amount: number): string {
    return `$${Math.abs(amount).toLocaleString("es-AR")}`;
}

export default async function FinancesPage() {
    // Parallel fetch — both queries run at the same time
    const [transactions, monthlySummary] = await Promise.all([
        getTransactions(10),
        getMonthlySummary(),
    ]);

    // Get current month summary
    const currentMonth = monthlySummary[0];

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        💰 Finances
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Your complete financial overview
                    </p>
                </div>
                <Button size="sm">+ Transaction</Button>
            </div>

            {/* Summary cards — from monthly_summary view */}
            {currentMonth && (
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                    <Card>
                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                            Net Balance
                        </p>
                        <p className="mt-2 text-2xl font-bold text-[var(--color-info)]">
                            {formatCurrency(currentMonth.net_balance ?? 0)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                            Income
                        </p>
                        <p className="mt-2 text-2xl font-bold text-[var(--color-success)]">
                            {formatCurrency(currentMonth.total_income ?? 0)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                            Expenses
                        </p>
                        <p className="mt-2 text-2xl font-bold text-[var(--color-error)]">
                            {formatCurrency(currentMonth.total_expenses ?? 0)}
                        </p>
                    </Card>
                </div>
            )}

            {/* Transactions list */}
            {transactions.length > 0 ? (
                <Card>
                    <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        Recent Transactions
                    </h2>
                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--color-surface-2)]"
                            >
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {t.description ?? "No description"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant={t.type === "income" ? "success" : "default"}>
                                            {t.type}
                                        </Badge>
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {new Date(t.transaction_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={`text-sm font-semibold ${t.type === "income"
                                            ? "text-[var(--color-success)]"
                                            : "text-[var(--color-text-primary)]"
                                        }`}
                                >
                                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            ) : (
                <EmptyState
                    icon="💰"
                    title="No transactions yet"
                    description="Record your first transaction to start tracking finances."
                />
            )}
        </div>
    );
}
