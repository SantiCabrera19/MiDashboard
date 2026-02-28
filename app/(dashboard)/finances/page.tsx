// ─── Finances Page ──────────────────────────────────────
// Server Component — Finances module.
// Route: /finances
//
// NO MOCK DATA. Shows EmptyState until Supabase is connected.

import type { Metadata } from "next";
import { Button, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
    title: "Finances",
    description: "Track income, expenses, debts, and financial goals.",
};

export default function FinancesPage() {
    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        💰 Finances
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Income, expenses, debts — your complete financial overview
                    </p>
                </div>
                <Button size="sm">+ Transaction</Button>
            </div>

            {/* Empty state */}
            <EmptyState
                icon="💰"
                title="No transactions yet"
                description="Your financial data from Supabase will appear here once connected."
            />
        </div>
    );
}
