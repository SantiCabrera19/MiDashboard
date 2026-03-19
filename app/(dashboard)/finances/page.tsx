// ─── Finances Page ──────────────────────────────────────
// Server Component — fetches REAL financial data from Supabase.
// Route: /finances
//
// ARCHITECTURE:
// Same pattern as Notes: Server Component fetches data,
// Client Components handle interactivity (forms, delete, edit).
// Categories are fetched here and passed to child components
// so they can populate dropdowns without separate client fetches.

import type { Metadata } from "next";
import { Card, EmptyState } from "@/components/ui";
import { getTransactions, getCategories, getMonthlySummary } from "@/lib/data/transactions";
import { getDebts } from "@/lib/data/debts";
import TransactionRow from "./TransactionRow";
import NewTransactionButton from "./NewTransactionButton";
import DebtCard from "./DebtCard";
import NewDebtButton from "./NewDebtButton";

export const metadata: Metadata = {
    title: "Finances",
    description: "Track income, expenses, debts, and financial goals.",
};

function formatCurrency(amount: number): string {
    return `$${Math.abs(amount).toLocaleString("es-AR")}`;
}

export default async function FinancesPage() {
    // Parallel fetch — all three run simultaneously
    const [transactions, categories, monthlySummary, debts] = await Promise.all([
        getTransactions(),
        getCategories(),
        getMonthlySummary(),
        getDebts(),
    ]);

    const currentMonth = monthlySummary[0];

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        💰 Finances
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"} total
                    </p>
                </div>
                <NewTransactionButton categories={categories} />
            </div>

            {/* Summary cards — from monthly_summary view */}
            {currentMonth && (
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                    <Card>
                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                            Net Balance
                        </p>
                        <p className="mt-2 text-xl sm:text-2xl font-bold text-[var(--color-info)]">
                            {formatCurrency(currentMonth.net_balance ?? 0)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                            Income
                        </p>
                        <p className="mt-2 text-xl sm:text-2xl font-bold text-[var(--color-success)]">
                            {formatCurrency(currentMonth.total_income ?? 0)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                            Expenses
                        </p>
                        <p className="mt-2 text-xl sm:text-2xl font-bold text-[var(--color-error)]">
                            {formatCurrency(currentMonth.total_expenses ?? 0)}
                        </p>
                    </Card>
                </div>
            )}

            {/* Transactions list */}
            {transactions.length > 0 ? (
                <Card>
                    <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                        All Transactions
                    </h2>
                    <div className="space-y-1">
                        {transactions.map((t) => (
                            <TransactionRow
                                key={t.id}
                                transaction={t}
                                categories={categories}
                            />
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

            {/* ─── Debts & Installments ─── */}
            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        💳 Debts & Installments
                    </h2>
                    <NewDebtButton />
                </div>
                {debts.length > 0 ? (
                    <div className="space-y-3">
                        {debts.map((debt) => (
                            <DebtCard key={debt.id} debt={debt} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center">
                        <p className="text-sm text-[var(--color-text-muted)]">No active debts</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            Track loans, installments, and credit card debt
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
  
