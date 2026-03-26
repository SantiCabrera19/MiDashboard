// ─── Debts Data Queries ─────────────────────────────────
// Server-side data functions for the Debts module.
//
// WHY separate data functions?
// - Same pattern as notes.ts and transactions.ts
// - Page just calls getDebts() — doesn't know about Supabase internals
// - RLS policies filter by user automatically

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

// Re-export the row type for use in components
export type Debt = Tables<"debts">;
export type DebtPayment = Tables<"debt_payments">;

/**
 * Fetch all debts, ordered by active first, then by nearest due date.
 */
export async function getDebts(): Promise<Debt[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("debts")
        .select()
        .order("status", { ascending: true })
        .order("next_due_date", { ascending: true });

    if (error) {
        console.error("Error fetching debts:", error.message);
        return [];
    }
    return data;
}

/**
 * Fetch payment history for a single debt (most recent first).
 */
export async function getDebtPayments(debtId: string): Promise<DebtPayment[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("debt_payments")
        .select()
        .eq("debt_id", debtId)
        .order("paid_at", { ascending: false });

    if (error) {
        console.error("Error fetching debt payments:", error.message);
        return [];
    }

    return data;
}
