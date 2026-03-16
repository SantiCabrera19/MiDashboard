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
import TransactionRow from "./TransactionRow";
import NewTransactionButton from "./NewTransactionButton";

export const metadata: Metadata = {
    title: "Finances",
    description: "Track income, expenses, debts, and financial goals.",
};

function formatCurrency(amount: number): string {
    return `$${Math.abs(amount).toLocaleString("es-AR")}`;
}

export default async function FinancesPage() {
    // Parallel fetch — all three run simultaneously
    const [transactions, categories, monthlySummary] = await Promise.all([
        getTransactions(),
        getCategories(),
        getMonthlySummary(),
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
        </div>
    );
}
  
