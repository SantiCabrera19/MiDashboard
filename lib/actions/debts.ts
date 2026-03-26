"use server";

// ─── Debt Server Actions ────────────────────────────────
// Mutations for the Debts module.
// Same pattern as transactions: Server Action → Supabase → revalidatePath.

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResponse = { success: boolean; error?: string };

/**
 * Create a new debt entry.
 */
export async function createDebt(payload: {
    title: string;
    total_amount: number;
    monthly_payment: number | null;
    installments_total: number | null;
    next_due_date: string | null;
    notes: string | null;
}): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const { error } = await supabase.from("debts").insert({
            ...payload,
            user_id: user.id,
            status: "active",
            paid_amount: 0,
            installments_paid: 0,
        });

        if (error) return { success: false, error: error.message };
        revalidatePath("/finances");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Mark a debt as fully paid.
 */
export async function markDebtPaid(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        const { data: debt, error: fetchError } = await supabase
            .from("debts")
            .select("total_amount")
            .eq("id", id)
            .single();

        if (fetchError || !debt) return { success: false, error: "Debt not found" };

        const { error } = await supabase
            .from("debts")
            .update({
                status: "paid",
                paid_amount: debt.total_amount,
                installments_paid: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) return { success: false, error: error.message };
        revalidatePath("/finances");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Delete a debt by ID.
 */
export async function deleteDebt(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from("debts").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
        revalidatePath("/finances");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Record a partial installment payment for a debt.
 * Updates debt progress based on accumulated payment history.
 */
export async function recordInstallmentPayment(
    debtId: string,
    amount: number,
    notes?: string
): Promise<ActionResponse> {
    try {
        if (!Number.isFinite(amount) || amount <= 0) {
            return { success: false, error: "Amount must be greater than 0" };
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const { data: debt, error: debtError } = await supabase
            .from("debts")
            .select("id, user_id, total_amount, installments_total")
            .eq("id", debtId)
            .single();

        if (debtError || !debt) return { success: false, error: "Debt not found" };

        const { error: insertError } = await supabase.from("debt_payments").insert({
            debt_id: debtId,
            amount_paid: amount,
            notes: notes?.trim() || null,
            paid_at: new Date().toISOString(),
        });

        if (insertError) return { success: false, error: insertError.message };

        const { data: payments, error: paymentsError } = await supabase
            .from("debt_payments")
            .select("amount_paid")
            .eq("debt_id", debtId);

        if (paymentsError) return { success: false, error: paymentsError.message };

        const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount_paid), 0);
        const clampedPaid = Math.min(Number(debt.total_amount), totalPaid);
        const remaining = Math.max(0, Number(debt.total_amount) - clampedPaid);
        const paymentCount = payments.length;

        const isFullyPaid = remaining <= 0;
        const installmentsPaid = debt.installments_total
            ? Math.min(Number(debt.installments_total), paymentCount)
            : null;

        const { error: updateError } = await supabase
            .from("debts")
            .update({
                paid_amount: clampedPaid,
                remaining_amount: remaining,
                installments_paid: installmentsPaid,
                status: isFullyPaid ? "paid" : "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", debtId);

        if (updateError) return { success: false, error: updateError.message };

        revalidatePath("/finances");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}
